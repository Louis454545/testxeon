import { capturePage } from "../browser/capture";
import {
  connectToActiveTab,
  disconnect,
  getActiveTabUrl,
  getCurrentWindowTabs,
  reconnectToActiveTab,
  type BrowserConnection,
} from "../browser/connection";
import { executeAction, type ActionExecutionContext } from "../browser/actions";
import { generateNextAgentStep } from "./aiClient";
import { getSystemPrompt, getSettings } from "../storage/settings";
import { saveRun } from "../storage/runs";
import { isFinalAction } from "../shared/actions";
import type { ActionResult, AgentRun, ChatMessage, RunStep } from "../shared/types";

export interface AgentRunnerOptions {
  conversationId: string;
  previousMessages: ChatMessage[];
  onRunUpdate?: (run: AgentRun) => void;
}

export class AgentRunner {
  private connection: BrowserConnection | null = null;

  async run(task: string, options: AgentRunnerOptions, abortSignal?: AbortSignal): Promise<AgentRun> {
    const settings = await getSettings();
    const systemPrompt = await getSystemPrompt();
    const run: AgentRun = {
      id: crypto.randomUUID(),
      conversationId: options.conversationId,
      task,
      status: "running",
      model: settings.model,
      provider: settings.provider,
      startedAt: new Date().toISOString(),
      steps: [],
    };

    const previousActionResults: ActionResult[] = [];
    const actionFingerprints = new Map<string, number>();

    try {
      this.connection = await connectToActiveTab();

      let index = 0;
      while (true) {
        throwIfAborted(abortSignal);

        const step = createStep(index);
        run.steps.push(step);
        updateRun(run, options.onRunUpdate);

        step.status = "capturing";
        step.message = "Reading the page...";
        updateRun(run, options.onRunUpdate);

        const tabs = await getCurrentWindowTabs();
        const currentUrl = await getActiveTabUrl();
        const captured = await capturePage(this.connection.page, settings.screenshotsEnabled);

        step.status = previousActionResults.at(-1)?.success === false ? "recovering" : "thinking";
        step.message = step.status === "recovering" ? "Recovering from the last failed action..." : "Planning next move...";
        updateRun(run, options.onRunUpdate);

        const aiResult = await generateNextAgentStep({
          settings,
          systemPrompt,
          task: index === 0 ? task : undefined,
          currentUrl,
          tabs,
          accessibilityTree: captured.accessibilityTree,
          screenshot: captured.screenshot,
          previousMessages: options.previousMessages,
          previousActionResults,
          stepIndex: index,
          abortSignal,
        });

        const actions = aiResult.response.action;
        const proposedFingerprint = fingerprintActions(actions);
        if (proposedFingerprint) {
          const seen = (actionFingerprints.get(proposedFingerprint) ?? 0) + 1;
          actionFingerprints.set(proposedFingerprint, seen);
          if (seen >= 3) {
            step.status = "failed";
            step.completedAt = new Date().toISOString();
            run.status = "failed";
            run.error = "The agent repeated the same action plan too many times without progress.";
            run.completedAt = new Date().toISOString();
            await saveRun(run);
            updateRun(run, options.onRunUpdate);
            return run;
          }
        }

        step.message = aiResult.response.current_state.message;
        step.evaluation = aiResult.response.current_state.evaluation;
        step.memory = aiResult.response.current_state.memory;
        step.usage = aiResult.usage;
        step.actions = actions.map((action) => ({ action }));
        step.status = actions.length ? "running" : "completed";
        updateRun(run, options.onRunUpdate);

        if (actions.length === 0) {
          step.status = "failed";
          step.completedAt = new Date().toISOString();
          run.status = "failed";
          run.error = "The model returned no action and no final answer.";
          run.completedAt = new Date().toISOString();
          await saveRun(run);
          updateRun(run, options.onRunUpdate);
          return run;
        }

        const actionContext: ActionExecutionContext = {
          page: this.connection.page,
          nodeMap: captured.nodeMap,
          attempt: getAttemptForActions(previousActionResults, actions),
          reconnect: async () => {
            this.connection = await reconnectToActiveTab(this.connection);
            return this.connection.page;
          },
        };

        let shouldRecover = false;
        for (let actionIndex = 0; actionIndex < actions.length; actionIndex++) {
          throwIfAborted(abortSignal);
          const action = actions[actionIndex];
          step.actions[actionIndex].isExecuting = true;
          updateRun(run, options.onRunUpdate);

          const result = await executeAction(action, actionContext);
          previousActionResults.push(result);
          step.actions[actionIndex] = {
            action,
            success: result.success,
            isExecuting: false,
            error: result.error,
          };
          updateRun(run, options.onRunUpdate);

          if (!result.success) {
            step.status = "recovering";
            step.completedAt = new Date().toISOString();
            step.message = "Action failed. Re-reading the page to recover.";
            updateRun(run, options.onRunUpdate);
            shouldRecover = true;
            break;
          }

          if (isFinalAction(action)) {
            step.status = "completed";
            step.completedAt = new Date().toISOString();
            run.status = "ask" in action ? "needs_input" : "completed";
            run.completedAt = new Date().toISOString();
            await saveRun(run);
            updateRun(run, options.onRunUpdate);
            return run;
          }
        }

        if (shouldRecover) {
          index += 1;
          continue;
        }

        step.status = "completed";
        step.completedAt = new Date().toISOString();
        updateRun(run, options.onRunUpdate);
        index += 1;
      }
    } catch (error) {
      const isAbort = isAbortError(error);
      run.status = isAbort ? "cancelled" : "failed";
      run.error = isAbort ? "Cancelled by user" : error instanceof Error ? error.message : String(error);
      run.completedAt = new Date().toISOString();
      const activeStep = run.steps.findLast((step) => step.status === "thinking" || step.status === "running");
      if (activeStep) {
        activeStep.status = isAbort ? "cancelled" : "failed";
        activeStep.completedAt = new Date().toISOString();
      }
      await saveRun(run);
      updateRun(run, options.onRunUpdate);
      return run;
    } finally {
      await disconnect(this.connection);
      this.connection = null;
    }
  }
}

function createStep(index: number): RunStep {
  return {
    id: crypto.randomUUID(),
    index,
    status: "thinking",
    message: "Thinking...",
    actions: [],
    startedAt: new Date().toISOString(),
  };
}

function fingerprintActions(actions: unknown[]): string {
  if (actions.length === 0) return "";
  return JSON.stringify(actions);
}

function getAttemptForActions(previousResults: ActionResult[], actions: unknown[]): number {
  const fingerprint = fingerprintActions(actions);
  if (!fingerprint) return 1;
  const previousAttempts = previousResults
    .filter((result) => fingerprintActions([result.action]) === fingerprint)
    .map((result) => result.attempt);
  return previousAttempts.length ? Math.max(...previousAttempts) + 1 : 1;
}

function updateRun(run: AgentRun, onRunUpdate?: (run: AgentRun) => void): void {
  onRunUpdate?.(structuredClone(run));
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

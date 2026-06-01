import { generateText, Output, type ModelMessage } from "ai";
import { agentResponseSchema, type AgentResponse } from "../shared/actions";
import type { ActionResult, AISettings, ChatMessage } from "../shared/types";
import { resolveLanguageModel } from "./providerClient";
import { buildAgentContext } from "./prompt";

interface NextStepInput {
  settings: AISettings;
  systemPrompt: string;
  task?: string;
  currentUrl: string;
  tabs: Array<{ id: string; title: string; url: string; active: boolean }>;
  accessibilityTree: unknown;
  screenshot?: string;
  previousMessages: ChatMessage[];
  previousActionResults: ActionResult[];
  stepIndex: number;
  abortSignal?: AbortSignal;
}

export interface NextStepResult {
  response: AgentResponse;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export async function generateNextAgentStep(input: NextStepInput): Promise<NextStepResult> {
  const context = buildAgentContext(input);
  const messages: ModelMessage[] = [
    {
      role: "user",
      content: input.screenshot
        ? [
            { type: "text", text: context },
            { type: "image", image: input.screenshot, mediaType: "image/png" },
          ]
        : context,
    },
  ];

  const result = await generateText({
    model: resolveLanguageModel(input.settings),
    system: input.systemPrompt,
    messages,
    maxOutputTokens: 2048,
    maxRetries: 1,
    abortSignal: input.abortSignal,
    output: Output.object({
      schema: agentResponseSchema,
      name: "browser_agent_step",
      description: "The next browser automation step and short user-visible status.",
    }),
  });

  return {
    response: result.output,
    usage: normalizeUsage(result.usage),
  };
}

function normalizeUsage(usage: unknown): NextStepResult["usage"] {
  if (!usage || typeof usage !== "object") return undefined;
  const data = usage as Record<string, unknown>;
  return {
    inputTokens: numberOrUndefined(data.inputTokens),
    outputTokens: numberOrUndefined(data.outputTokens),
    totalTokens: numberOrUndefined(data.totalTokens),
  };
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

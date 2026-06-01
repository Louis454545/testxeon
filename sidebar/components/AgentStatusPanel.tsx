import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentRun } from "../../src/shared/types";

export function AgentStatusPanel({ run, isSending }: { run: AgentRun | null; isSending: boolean }) {
  const stats = getStats(run);
  const state = run?.status ?? (isSending ? "running" : "idle");

  return (
    <section className="border-b bg-muted/20 px-3 py-3">
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <StatusIcon status={state} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{getTitle(run, isSending)}</div>
              <div className="truncate text-xs text-muted-foreground">{getSubtitle(run)}</div>
            </div>
          </div>
          <span className={cn("rounded-md px-2 py-1 text-xs font-medium capitalize", getBadgeClass(state))}>
            {state.replace("_", " ")}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Metric icon={CircleDashed} label="Steps" value={stats.steps} />
          <Metric icon={Zap} label="Actions" value={stats.actions} />
          <Metric icon={Clock3} label="Tokens" value={stats.tokens} />
        </div>
      </div>
    </section>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "running") return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (status === "failed") return <AlertTriangle className="h-5 w-5 text-destructive" />;
  return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted px-2 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="mt-1 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function getStats(run: AgentRun | null) {
  return {
    steps: run?.steps.length ?? 0,
    actions: run?.steps.reduce((count, step) => count + step.actions.length, 0) ?? 0,
    tokens: run?.steps.reduce((count, step) => count + (step.usage?.totalTokens ?? 0), 0) ?? 0,
  };
}

function getTitle(run: AgentRun | null, isSending: boolean): string {
  if (!run && isSending) return "Starting agent";
  if (!run) return "Agent ready";
  return run.task;
}

function getSubtitle(run: AgentRun | null): string {
  if (!run) return "Ask for a task and the agent will operate the active tab.";
  const latest = [...run.steps].reverse().find((step) => step.message);
  return latest?.message || `${run.provider}/${run.model}`;
}

function getBadgeClass(status: string): string {
  if (status === "completed") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (status === "failed") return "bg-destructive/10 text-destructive";
  if (status === "needs_input") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "running") return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
}

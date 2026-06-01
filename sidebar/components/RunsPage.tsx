import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCcw, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearRuns, listRuns } from "../../src/storage/runs";
import type { AgentRun } from "../../src/shared/types";
import { cn } from "@/lib/utils";

export function RunsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const totals = useMemo(
    () => ({
      runs: runs.length,
      actions: runs.reduce((count, run) => count + run.steps.reduce((sum, step) => sum + step.actions.length, 0), 0),
      tokens: runs.reduce((count, run) => count + run.steps.reduce((sum, step) => sum + (step.usage?.totalTokens ?? 0), 0), 0),
    }),
    [runs],
  );

  const refresh = async () => {
    setRuns(await listRuns());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleClear = async () => {
    await clearRuns();
    setRuns([]);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b bg-background px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Runs</h2>
            <p className="text-xs text-muted-foreground">Latest harness traces</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={refresh}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <Metric label="Runs" value={totals.runs} />
          <Metric label="Actions" value={totals.actions} />
          <Metric label="Tokens" value={totals.tokens} />
        </div>
      </div>

      <div className="space-y-3 p-3">
        {runs.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">No runs yet</div>
        ) : (
          runs.map((run) => <RunCard key={run.id} run={run} />)
        )}
      </div>
    </div>
  );
}

function RunCard({ run }: { run: AgentRun }) {
  const actionCount = run.steps.reduce((sum, step) => sum + step.actions.length, 0);
  const tokenCount = run.steps.reduce((sum, step) => sum + (step.usage?.totalTokens ?? 0), 0);
  const StatusIcon = run.status === "completed" ? CheckCircle2 : run.status === "failed" ? AlertTriangle : Zap;

  return (
    <article className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{run.task}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{new Date(run.startedAt).toLocaleString()}</span>
          </div>
        </div>
        <span className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-xs capitalize", statusClass(run.status))}>
          <StatusIcon className="h-3.5 w-3.5" />
          {run.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Metric label="Steps" value={run.steps.length} />
        <Metric label="Actions" value={actionCount} />
        <Metric label="Tokens" value={tokenCount} />
      </div>

      <div className="mt-3 space-y-1">
        {run.steps.slice(-5).map((step) => (
          <div key={step.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
            <span className="truncate">{step.message}</span>
            <span className="shrink-0 capitalize text-muted-foreground">{step.status}</span>
          </div>
        ))}
      </div>

      {run.error && <p className="mt-3 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">{run.error}</p>}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted px-2 py-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function statusClass(status: AgentRun["status"]): string {
  if (status === "completed") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (status === "failed") return "bg-destructive/10 text-destructive";
  if (status === "needs_input") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "cancelled") return "bg-muted text-muted-foreground";
  return "bg-primary/10 text-primary";
}

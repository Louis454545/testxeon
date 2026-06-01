import type { AgentRun } from "../shared/types";

const RUNS_KEY = "agentRuns.v1";
const MAX_RUNS = 50;

export async function listRuns(): Promise<AgentRun[]> {
  const data = await chrome.storage.local.get(RUNS_KEY);
  const runs = Array.isArray(data[RUNS_KEY]) ? (data[RUNS_KEY] as AgentRun[]) : [];
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function saveRun(run: AgentRun): Promise<void> {
  const runs = await listRuns();
  const next = [run, ...runs.filter((existing) => existing.id !== run.id)]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, MAX_RUNS);
  await chrome.storage.local.set({ [RUNS_KEY]: next });
}

export async function clearRuns(): Promise<void> {
  await chrome.storage.local.set({ [RUNS_KEY]: [] });
}

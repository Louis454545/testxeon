import type { AgentAction } from "./actions";

export type ProviderId = "google" | "openai";

export interface AISettings {
  apiKey: string;
  model: string;
  provider: ProviderId;
  screenshotsEnabled: boolean;
}

export interface TabInfo {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface ActionResult {
  action: AgentAction;
  success: boolean;
  description: string;
  error?: string;
  durationMs: number;
  attempt: number;
}

export interface RunStep {
  id: string;
  index: number;
  status: "capturing" | "thinking" | "running" | "recovering" | "completed" | "failed" | "cancelled";
  message: string;
  actions: Array<{
    action: AgentAction;
    success?: boolean;
    isExecuting?: boolean;
    error?: string;
  }>;
  startedAt: string;
  completedAt?: string;
  evaluation?: string;
  memory?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface AgentRun {
  id: string;
  conversationId: string;
  task: string;
  status: "running" | "completed" | "failed" | "cancelled" | "needs_input";
  model: string;
  provider: ProviderId;
  startedAt: string;
  completedAt?: string;
  steps: RunStep[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  runId?: string;
  segments?: RunStep[];
}

export interface StoredConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  lastUpdated: string;
  preview: string;
}

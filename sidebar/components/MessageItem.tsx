import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  Keyboard,
  Layers,
  Loader2,
  MessageCircleQuestion,
  MousePointerClick,
  PencilLine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageItemProps, MessageSegment } from "../types";
import type { Action } from "../types/api";

const actionMeta = {
  input: { icon: PencilLine, label: "Input", tone: "text-blue-600 bg-blue-500/10" },
  click: { icon: MousePointerClick, label: "Click", tone: "text-violet-600 bg-violet-500/10" },
  navigate: { icon: Globe, label: "Navigate", tone: "text-green-600 bg-green-500/10" },
  switch_tab: { icon: Layers, label: "Switch tab", tone: "text-orange-600 bg-orange-500/10" },
  back: { icon: ArrowLeft, label: "Back", tone: "text-amber-600 bg-amber-500/10" },
  forward: { icon: ArrowRight, label: "Forward", tone: "text-cyan-600 bg-cyan-500/10" },
  keyboard: { icon: Keyboard, label: "Key", tone: "text-pink-600 bg-pink-500/10" },
  wait: { icon: Clock, label: "Wait", tone: "text-muted-foreground bg-muted" },
  ask: { icon: MessageCircleQuestion, label: "Ask", tone: "text-amber-700 bg-amber-500/10" },
  done: { icon: CheckCircle2, label: "Done", tone: "text-green-700 bg-green-500/10" },
} as const;

export function MessageItem({ message }: MessageItemProps) {
  if (message.isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-lg bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const segments = message.snapshot?.segments;
  if (segments?.length) {
    return (
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <AgentStep key={segment.id ?? index} index={index} segment={segment} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] rounded-lg border bg-card px-3 py-2 text-sm">
      <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
        {message.content}
      </ReactMarkdown>
    </div>
  );
}

function AgentStep({
  index,
  segment,
}: {
  index: number;
  segment: MessageSegment;
}) {
  const content = segment.content || segment.message || "";
  const status = segment.status ?? (content === "Thinking..." ? "thinking" : "completed");
  const finalMessage = getFinalMessage(segment.actions, content);
  const isActive = ["capturing", "thinking", "running", "recovering"].includes(status);

  return (
    <article className={cn("rounded-lg border bg-card", isActive && "border-primary/40")}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <StepStatus status={status} />
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Step {index + 1}
            </div>
            <div className="truncate text-sm font-medium">{finalMessage || content || status}</div>
          </div>
        </div>
        <span className={cn("rounded-md px-2 py-1 text-xs capitalize", statusClass(status))}>
          {status}
        </span>
      </div>

      {finalMessage && (
        <div className="px-3 py-2 text-sm leading-relaxed">
          <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
            {finalMessage}
          </ReactMarkdown>
        </div>
      )}

      {segment.actions.length > 0 && (
        <div className="space-y-1.5 px-3 pb-3 pt-2">
          {segment.actions.map(({ action, success, isExecuting, error }, actionIndex) => (
            <ActionRow
              key={`${actionIndex}-${getActionName(action)}`}
              action={action}
              success={success}
              isExecuting={isExecuting}
              error={error}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function StepStatus({ status }: { status: string }) {
  if (["capturing", "thinking", "running", "recovering"].includes(status)) {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />;
  }
  if (status === "failed") return <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />;
  if (status === "cancelled") return <X className="h-4 w-4 shrink-0 text-muted-foreground" />;
  return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />;
}

function ActionRow({
  action,
  success,
  isExecuting,
  error,
}: {
  action: Action;
  success?: boolean;
  isExecuting?: boolean;
  error?: string;
}) {
  if ("done" in action) return null;

  const name = getActionName(action);
  const meta = actionMeta[name] ?? actionMeta.click;
  const Icon = meta.icon;

  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", meta.tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{getActionDescription(action)}</div>
          <div className="text-xs text-muted-foreground">{meta.label}</div>
        </div>
        {isExecuting ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : success === true ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : success === false ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : null}
      </div>
      {error && <div className="mt-2 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{error}</div>}
    </div>
  );
}

function getActionName(action: Action): keyof typeof actionMeta {
  return Object.keys(action)[0] as keyof typeof actionMeta;
}

function getActionDescription(action: Action): string {
  if (action.input) return action.input.description || `Type "${action.input.text}"`;
  if (action.click) return action.click.description || `Click element ${action.click.id}`;
  if (action.navigate) return action.navigate.description || action.navigate.url;
  if (action.switch_tab) return action.switch_tab.description || `Tab ${action.switch_tab.tab_id}`;
  if (action.back) return action.back.description || "Go back";
  if (action.forward) return action.forward.description || "Go forward";
  if (action.keyboard) return action.keyboard.description || `Press ${action.keyboard.key || action.keyboard.keys}`;
  if (action.wait) return action.wait.description || `Wait ${action.wait.duration || action.wait.time || 1}`;
  if (action.ask) return action.ask.query;
  if (action.done) return action.done.message;
  return "Action";
}

function getFinalMessage(
  actions: MessageSegment["actions"],
  fallback: string,
): string {
  const done = actions.find(({ action }) => "done" in action)?.action;
  if (done?.done) return done.done.message;
  const ask = actions.find(({ action }) => "ask" in action)?.action;
  if (ask?.ask) return ask.ask.query;
  return fallback === "Thinking..." ? "" : fallback;
}

function statusClass(status: string): string {
  if (status === "completed") return "bg-green-500/10 text-green-700 dark:text-green-300";
  if (status === "failed") return "bg-destructive/10 text-destructive";
  if (status === "recovering") return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "cancelled") return "bg-muted text-muted-foreground";
  return "bg-primary/10 text-primary";
}

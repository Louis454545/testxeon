import { MessageItemProps } from "../types";
import { 
  PencilLine, 
  MousePointerClick, 
  Globe, 
  LayoutGrid, 
  Check, 
  XCircle,
  Loader2
} from "lucide-react";
import { Action, ActionName } from "../types/api";
import { ThinkingMessage } from "./ThinkingMessage";
import { cn } from "@/lib/utils";

const MAX_ACTION_DESC_LENGTH = 31; // Limite pour la description de l'action

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const getActionConfig = (action: Action) => {
  const configs = {
    [ActionName.INPUT]: {
      icon: PencilLine,
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      textColor: 'text-blue-800 dark:text-blue-200',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    [ActionName.CLICK]: {
      icon: MousePointerClick,
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      textColor: 'text-purple-800 dark:text-purple-200',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    [ActionName.GO_TO_URL]: {
      icon: Globe,
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      textColor: 'text-green-800 dark:text-green-200',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    [ActionName.SWITCH_TAB]: {
      icon: LayoutGrid,
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      textColor: 'text-orange-800 dark:text-orange-200',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  };
  return configs[action.name] || configs[ActionName.CLICK];
};

const ActionBadge = ({ action, isExecuting }: { action: Action; isExecuting?: boolean }) => {
  const config = getActionConfig(action);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
        config.bgColor,
        config.textColor,
        config.borderColor,
        "hover:opacity-90"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium truncate max-w-[200px]">
        {truncateText(action.args.description || action.name, MAX_ACTION_DESC_LENGTH)}
      </span>
      {isExecuting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
      ) : (
        typeof (window as any).lastActionSuccess === 'boolean' && (
          (window as any).lastActionSuccess ? 
            <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 ml-1" /> :
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 ml-1" />
        )
      )}
    </div>
  );
};

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="flex flex-col gap-3 mb-6 last:mb-2">
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        {!message.isUser && message.content === "Thinking..." ? (
          <ThinkingMessage />
        ) : (
          <div
            className={cn(
              "rounded-xl px-4 py-3 max-w-[85%] shadow-sm",
              "border border-border/50",
              message.isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card text-card-foreground"
            )}
          >
            {message.snapshot && message.snapshot.segments ? (
              message.snapshot.segments.map((segment, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <p className="whitespace-pre-line leading-relaxed text-[15px]">
                    {segment.content}
                  </p>
                  {segment.actions && segment.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {segment.actions.map((action, j) => (
                        <ActionBadge key={j} action={action} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <>
                <p className="whitespace-pre-line leading-relaxed text-[15px]">
                  {message.content}
                </p>
                {!message.isUser && message.snapshot?.action && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Array.isArray(message.snapshot.action)
                      ? message.snapshot.action
                      : [message.snapshot.action]
                    ).map((action, index) => (
                      <ActionBadge key={index} action={action} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
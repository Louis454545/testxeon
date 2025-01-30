import { Message } from "../types";
import { ActionBox } from "./ActionBox";
import { cn } from "../../lib/utils";
import { ApiResponse } from "../types/api";
import { Action } from "../utils/ActionOperator";

interface MessageItemProps {
  message: Message;
}

interface ActionWithStatus {
  action: Action;  // Changed from ApiResponse['action'] to Action
  index: number;
  isLast: boolean;
}

export function MessageItem({ message }: MessageItemProps) {
  const hasAction = message.snapshot?.action !== undefined;
  const hasContent = message.content?.trim().length > 0;

  // Get all actions from the message history
  const getActionHistory = (): ActionWithStatus[] => {
    const actions: ActionWithStatus[] = [];
    if (message.snapshot?.action) {  // Type guard to ensure action is defined
      actions.push({
        action: message.snapshot.action,
        index: 0,
        isLast: true
      });
    }
    return actions;
  };

  const actions = getActionHistory();

  return (
    <div
      className={cn(
        "flex flex-col px-4 py-2",
        message.isUser ? "items-end" : "items-start"
      )}
    >
      {/* Message bubble */}
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[85%] break-words",
          message.isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {/* Content section (if exists and not an error) */}
        {hasContent && !message.snapshot?.error && (
          <div className="mb-2 whitespace-pre-wrap">{message.content}</div>
        )}

        {/* Actions section */}
        {actions.length > 0 && (
          <div className="space-y-2 mt-2">
            {actions.map((actionItem, idx) => (
              <ActionBox
                key={idx}
                action={actionItem.action}
                success={window.lastActionSuccess}
              />
            ))}
          </div>
        )}

        {/* Error section */}
        {message.snapshot?.error && (
          <div className="text-destructive whitespace-pre-wrap">
            {message.content}
            {message.snapshot.error && (
              <div className="mt-1 text-sm opacity-80">
                Error: {message.snapshot.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
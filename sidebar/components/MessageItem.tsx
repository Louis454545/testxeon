import { MessageItemProps } from "../types";
import { PencilLine, MousePointerClick } from "lucide-react";
import { ActionType } from "../utils/ActionOperator";

export function MessageItem({ message }: MessageItemProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case ActionType.INPUT:
        return <PencilLine className="w-5 h-5 inline-block mr-2" />;
      case ActionType.CLICK:
        return <MousePointerClick className="w-5 h-5 inline-block mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`rounded-lg px-4 py-2 max-w-[80%] ${
            message.isUser
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-secondary/50 text-secondary-foreground'
          }`}
        >
          {/* Message content */}
          <p className="mb-1">{message.content}</p>

          {/* Action details in same bubble for assistant messages */}
          {!message.isUser && message.snapshot?.action && (
            <div className="mt-2 pt-2 border-t border-secondary-foreground/20">
              <div className="flex items-center text-xs text-muted-foreground">
                {getActionIcon(message.snapshot.action.type)}
                {message.snapshot.action.description && (
                  <span>{message.snapshot.action.description}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
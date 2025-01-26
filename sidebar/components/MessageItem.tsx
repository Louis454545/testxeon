import { MessageItemProps } from "../types";

export function MessageItem({ message }: MessageItemProps) {
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
              <p className="text-xs text-muted-foreground">
                Action: {message.snapshot.action.type}
              </p>
              {message.snapshot.action.description && (
                <p className="text-xs text-muted-foreground">
                  Description: {message.snapshot.action.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
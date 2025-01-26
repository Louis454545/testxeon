import { MessageItemProps } from "../types"

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
          {message.content}
        </div>
      </div>
      {message.snapshot && (
        <div className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`rounded-lg px-4 py-2 max-w-[80%] ${
              !message.isUser
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-secondary/50 text-secondary-foreground'
            }`}
          >
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[200px]">
              {typeof message.snapshot === 'string'
                ? message.snapshot
                : JSON.stringify(message.snapshot, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
import { MessageItemProps } from "../types"

export function MessageItem({ message }: MessageItemProps) {
  return (
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
  )
}
import { MessageListProps } from "../types"
import { MessageItem } from "./MessageItem"

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </div>
  )
}
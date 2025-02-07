import { MessageListProps } from "../types"
import { MessageItem } from "./MessageItem"
import { useEffect, useRef } from "react"

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollHeight = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wasNearBottom = container.scrollTop + container.clientHeight >= lastScrollHeight.current - 50
    
    lastScrollHeight.current = container.scrollHeight

    if (wasNearBottom) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </div>
  )
}
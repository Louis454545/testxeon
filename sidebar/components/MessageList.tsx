import { MessageListProps } from "../types"
import { MessageItem } from "./MessageItem"
import { useEffect, useRef } from "react"
import { Bot, Sparkles } from "lucide-react"

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
      className="flex-1 overflow-y-auto p-3 space-y-3"
    >
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-sm rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold">Xeon is ready</div>
                <div className="text-xs text-muted-foreground">Ready</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              {["Research this page", "Compare visible options", "Navigate and complete the task"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id ?? `${message.timestamp}-${message.content}`} message={message} />
        ))
      )}
    </div>
  )
}

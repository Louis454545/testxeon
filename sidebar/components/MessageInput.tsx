import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontalIcon, Square } from "lucide-react"
import { MessageInputProps } from "../types"
import { cn } from "@/lib/utils"

export function MessageInput({ onSubmit, isSending, onCancel }: MessageInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    onSubmit(inputValue.trim())
    setInputValue("")
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "p-4",
        "bg-transparent"
      )}
    >
      <div className="flex items-center space-x-2 w-full">
        <div className="relative flex-1 group">
          <Input
            type="text"
            placeholder="Message for AI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={cn(
              "pr-12 py-6 text-base",
              "rounded-2xl",
              "bg-card/50 dark:bg-card/40",
              "border-border/50",
              "placeholder:text-muted-foreground/70",
              "transition-all duration-200",
              "hover:border-border/80",
              "focus-visible:bg-card/80",
              "focus-visible:ring-0",
              "focus-visible:ring-offset-0",
              "focus-visible:border-primary/50"
            )}
          />
          <Button 
            type={isSending ? "button" : "submit"}
            size="icon"
            variant="ghost"
            onClick={isSending ? onCancel : undefined}
            className={cn(
              "absolute right-1.5 top-1/2 -translate-y-1/2",
              "h-9 w-9",
              "transition-all duration-200",
              isSending ? 
                "text-destructive hover:text-destructive hover:bg-destructive/10 animate-pulse"
              : 
                inputValue.trim() === "" ? 
                  "text-primary hover:text-primary hover:bg-primary/10 opacity-70 pointer-events-none"
                : 
                  "text-primary hover:text-primary hover:bg-primary/10",
              "hover:scale-105 active:scale-95"
            )}
          >
            {isSending ? (
              <Square className="h-4 w-4 transition-transform hover:scale-110" />
            ) : (
              <SendHorizontalIcon className={cn(
                "h-4 w-4 transition-all duration-200",
                "group-hover:translate-x-0.5"
              )} />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
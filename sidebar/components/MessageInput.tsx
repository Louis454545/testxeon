import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizontalIcon, Square } from "lucide-react"
import { MessageInputProps } from "../types"

export function MessageInput({ onSubmit, isSending, onCancel }: MessageInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    onSubmit(inputValue.trim())
    setInputValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-between space-x-4 p-4 border-t">
      <div className="flex items-center space-x-2 w-full">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Message pour l'IA"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <Button 
          type={isSending ? "button" : "submit"}
          size="icon"
          onClick={isSending ? onCancel : undefined}
        >
          {isSending ? (
            <Square className="text-red-500" />
          ) : (
            <SendHorizontalIcon />
          )}
        </Button>
      </div>
    </form>
  )
}
import { Button } from "@/components/ui/button"
import { Plus, Settings, MessageSquareText } from "lucide-react"
import { HeaderProps } from "../types"

export function Header({ onNewConversation }: HeaderProps) {
  return (
    <div className="h-12 px-4 border-b flex justify-end items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onNewConversation}
      >
        <Plus size={20} />
      </Button>
      <MessageSquareText size={20} className="text-muted-foreground mx-1" />
      <Button 
        variant="ghost" 
        size="icon"
      >
        <Settings size={20} />
      </Button>
    </div>
  )
}
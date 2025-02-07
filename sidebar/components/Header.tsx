import { Button } from "@/components/ui/button"
import { Plus, Settings, MessageSquareText } from "lucide-react"
import { HeaderProps } from "../types"
import { ModelSelector } from "./ModelSelector"

export function Header({ onNewConversation, onViewConversations, onViewSettings }: HeaderProps) {
  return (
    <div className="h-12 px-4 border-b flex items-center gap-2">
      <div className="flex-1">
        <ModelSelector />
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 p-0"
          onClick={onNewConversation}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 p-0"
          onClick={onViewConversations}
        >
          <MessageSquareText className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 p-0"
          onClick={onViewSettings}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
import { Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConversationsPageProps, Conversation } from "../types"

function ConversationCard({ 
  conversation, 
  onClick, 
  onDelete 
}: { 
  conversation: Conversation; 
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <Card 
      className="p-4 hover:bg-secondary/50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div 
          className="flex-1 cursor-pointer" 
          onClick={onClick}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{conversation.title}</h3>
            <span className="text-sm text-muted-foreground">
              {conversation.lastUpdated.toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {conversation.preview}
          </p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="ml-4 h-8 w-8"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
    </Card>
  )
}

export function ConversationsPage({ 
  conversations, 
  onSelectConversation, 
  onSearch,
  onDeleteConversation
}: ConversationsPageProps) {
  const sortedConversations = [...conversations].sort(
    (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sortedConversations.length > 0 ? (
          <div className="space-y-4">
            {sortedConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onClick={() => onSelectConversation(conversation.id)}
                onDelete={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conversation.id)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
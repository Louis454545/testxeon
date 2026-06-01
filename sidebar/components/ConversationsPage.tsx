import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Conversation, ConversationsPageProps } from "../types";

export function ConversationsPage({
  conversations,
  onSelectConversation,
  onSearch,
  onDeleteConversation,
}: ConversationsPageProps) {
  const sorted = [...conversations].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            className="h-9 rounded-lg bg-card pl-9"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sorted.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">No conversations</div>
        ) : (
          <div className="space-y-2">
            {sorted.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                onOpen={() => onSelectConversation(conversation.id)}
                onDelete={() => onDeleteConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  onOpen,
  onDelete,
}: {
  conversation: Conversation;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-start gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="truncate text-sm font-semibold">{conversation.title}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{conversation.preview}</p>
          <div className="mt-2 text-[11px] text-muted-foreground">{conversation.lastUpdated.toLocaleString()}</div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-70 hover:opacity-100"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </article>
  );
}

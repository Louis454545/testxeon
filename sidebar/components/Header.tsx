import { Activity, MessageSquareText, PanelTop, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeaderProps } from "../types";
import { ModelSelector } from "./ModelSelector";

const navItems = [
  { id: "chat", label: "Chat", icon: MessageSquareText },
  { id: "runs", label: "Runs", icon: Activity },
  { id: "conversations", label: "History", icon: PanelTop },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function Header({
  activeView = "chat",
  onNewConversation,
  onViewChat,
  onViewConversations,
  onViewRuns,
  onViewSettings,
}: HeaderProps) {
  const handlers = {
    chat: onViewChat,
    runs: onViewRuns,
    conversations: onViewConversations,
    settings: onViewSettings,
  };

  return (
    <header className="border-b bg-background/95">
      <div className="flex h-14 items-center gap-2 px-3">
        <div className="min-w-0 flex-1">
          <ModelSelector />
        </div>
        <Button variant="default" size="icon" className="h-9 w-9 shrink-0" onClick={onNewConversation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <nav className="grid grid-cols-4 border-t bg-muted/30 px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={handlers[item.id]}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

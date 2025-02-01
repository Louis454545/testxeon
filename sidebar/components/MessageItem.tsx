import { MessageItemProps } from "../types";
import { PencilLine, MousePointerClick, Globe, LayoutGrid, Check, XCircle } from "lucide-react";
import { Action, ActionName } from "../types/api";
import { ThinkingMessage } from "./ThinkingMessage";

export function MessageItem({ message }: MessageItemProps) {
  const getActionIcon = (name: ActionName): React.ReactNode => {
    switch (name) {
      case ActionName.INPUT:
        return <PencilLine className="w-5 h-5 inline-block mr-2" />;
      case ActionName.CLICK:
        return <MousePointerClick className="w-5 h-5 inline-block mr-2" />;
      case ActionName.GO_TO_URL:
        return <Globe className="w-5 h-5 inline-block mr-2" />;
      case ActionName.SWITCH_TAB:
        return <LayoutGrid className="w-5 h-5 inline-block mr-2" />;
      default:
        return null;
    }
  };

  const renderAction = (action: Action, isLast: boolean) => (
    <div className="flex items-center text-xs text-muted-foreground mb-1">
      {getActionIcon(action.name)}
      <div className="flex-1">
        {action.args.description && (
          <span>{action.args.description}</span>
        )}
      </div>
      {/* Success/Failure icon */}
      {isLast && typeof (window as any).lastActionSuccess === 'boolean' && (
        (window as any).lastActionSuccess ? 
          <Check className="w-4 h-4 text-green-500 ml-2" /> :
          <XCircle className="w-4 h-4 text-red-500 ml-2" />
      )}
    </div>
  );

  const renderActions = (actions: Action | Action[]) => {
    const actionArray = Array.isArray(actions) ? actions : [actions];
    return actionArray.map((action, index) => (
      <div key={index}>
        {renderAction(action, index === actionArray.length - 1)}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        {!message.isUser && message.content === "Thinking..." ? (
          <ThinkingMessage />
        ) : (
          <div
            className={`rounded-lg px-4 py-2 max-w-[80%] ${
              message.isUser
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-secondary/50 text-secondary-foreground'
            }`}
          >
            {/* Message content */}
            <p className="mb-1">{message.content}</p>

            {/* Action details in same bubble for assistant messages */}
            {!message.isUser && message.snapshot?.action && (
              <div className="mt-2 pt-2 border-t border-secondary-foreground/20">
                {renderActions(message.snapshot.action)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
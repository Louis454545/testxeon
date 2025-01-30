import { Action, ActionType } from "../utils/ActionOperator";
import { Icons } from "./Icons";
import { cn } from "../../lib/utils";

interface ActionBoxProps {
  action: Action;
  success?: boolean;
}

export function ActionBox({ action, success }: ActionBoxProps) {
  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case ActionType.CLICK:
        return <Icons.click className="h-4 w-4 text-blue-400" />;
      case ActionType.INPUT:
        return <Icons.keyboard className="h-4 w-4 text-purple-400" />;
      case ActionType.ASK:
        return <Icons.help className="h-4 w-4 text-yellow-400" />;
      default:
        const _exhaustiveCheck: never = type;
        return null;
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return null;
    return status ? (
      <Icons.check className="h-4 w-4 text-green-500" />
    ) : (
      <Icons.x className="h-4 w-4 text-red-500" />
    );
  };

  const getBackgroundColor = (type: ActionType) => {
    switch (type) {
      case ActionType.CLICK:
        return "bg-blue-500/10 border-blue-500/20";
      case ActionType.INPUT:
        return "bg-purple-500/10 border-purple-500/20";
      case ActionType.ASK:
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        const _exhaustiveCheck: never = type;
        return "bg-muted/20 border-border/50";
    }
  };

  const getActionText = (action: Action): string => {
    switch (action.type) {
      case ActionType.CLICK:
        return action.description || "Click element";
      case ActionType.INPUT:
        const inputAction = action as { text: string; description?: string };
        return inputAction.text ? `Enter "${inputAction.text}"` : (action.description || "Enter text");
      case ActionType.ASK:
        const askAction = action as { text: string; description?: string };
        return askAction.text || action.description || "Waiting for input...";
      default:
        const _exhaustiveCheck: never = action;
        return "Unknown action";
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        getBackgroundColor(action.type),
        action.type === ActionType.ASK ? "border-yellow-500/50" : ""
      )}
    >
      <div className="flex-shrink-0">
        {getActionIcon(action.type)}
      </div>
      <div className="flex-grow text-sm">
        {getActionText(action)}
      </div>
      {action.type !== ActionType.ASK && (
        <div className="flex-shrink-0">
          {getStatusIcon(success)}
        </div>
      )}
    </div>
  );
}
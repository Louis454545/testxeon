import { MessageItemProps } from "../types";
import { 
  PencilLine, 
  MousePointerClick, 
  Globe, 
  LayoutGrid, 
  Check, 
  XCircle,
  Loader2,
  Sparkle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { Action, ActionName } from "../types/api";
import { ThinkingMessage } from "./ThinkingMessage";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'

const MAX_ACTION_DESC_LENGTH = 31; // Limite pour la description de l'action

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const getActionConfig = (action: Action) => {
  const configs = {
    [ActionName.INPUT]: {
      icon: PencilLine,
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200/50 dark:border-blue-400/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverBg: 'hover:bg-blue-100/80 dark:hover:bg-blue-500/20',
      shadowColor: 'shadow-blue-500/25'
    },
    [ActionName.CLICK]: {
      icon: MousePointerClick,
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200/50 dark:border-purple-400/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hoverBg: 'hover:bg-purple-100/80 dark:hover:bg-purple-500/20',
      shadowColor: 'shadow-purple-500/25'
    },
    [ActionName.NAVIGATE]: {
      icon: Globe,
      bgColor: 'bg-green-50 dark:bg-green-500/10',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200/50 dark:border-green-400/20',
      iconColor: 'text-green-600 dark:text-green-400',
      hoverBg: 'hover:bg-green-100/80 dark:hover:bg-green-500/20',
      shadowColor: 'shadow-green-500/25'
    },
    [ActionName.SWITCH_TAB]: {
      icon: LayoutGrid,
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200/50 dark:border-orange-400/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      hoverBg: 'hover:bg-orange-100/80 dark:hover:bg-orange-500/20',
      shadowColor: 'shadow-orange-500/25'
    },
    [ActionName.BACK]: {
      icon: ArrowLeft,
      bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200/50 dark:border-yellow-400/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      hoverBg: 'hover:bg-yellow-100/80 dark:hover:bg-yellow-500/20',
      shadowColor: 'shadow-yellow-500/25'
    },
    [ActionName.FORWARD]: {
      icon: ArrowRight,
      bgColor: 'bg-cyan-50 dark:bg-cyan-500/10',
      textColor: 'text-cyan-700 dark:text-cyan-300',
      borderColor: 'border-cyan-200/50 dark:border-cyan-400/20',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      hoverBg: 'hover:bg-cyan-100/80 dark:hover:bg-cyan-500/20',
      shadowColor: 'shadow-cyan-500/25'
    }
  };
  return configs[action.name] || configs[ActionName.CLICK];
};

const ActionBadge = ({ 
  action, 
  isExecuting,
  success
}: { 
  action: Action; 
  isExecuting?: boolean;
  success?: boolean;
}) => {
  const config = getActionConfig(action);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
        "border backdrop-blur-[2px]",
        "hover:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.3)]",
        "hover:-translate-y-[1px] active:translate-y-0",
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.hoverBg,
        "group/action"
      )}
    >
      <Icon className={cn(
        "w-3.5 h-3.5 transition-transform duration-200",
        config.iconColor,
        "group-hover/action:scale-110"
      )} />
      <span className={cn(
        "text-xs font-medium truncate max-w-[200px]",
        "transition-colors duration-200"
      )}>
        {truncateText(action.args.description || action.name, MAX_ACTION_DESC_LENGTH)}
      </span>
      {isExecuting ? (
        <Loader2 className={cn(
          "w-3.5 h-3.5 animate-spin ml-1",
          config.iconColor
        )} />
      ) : (
        success !== undefined && (
          success ? 
            <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 ml-1 animate-fade-scale" /> :
            <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 ml-1 animate-fade-scale" />
        )
      )}
    </div>
  );
};

export function MessageItem({ message }: MessageItemProps) {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialDark}
          language={match[1]}
          PreTag="div"
          className="rounded-lg p-4 my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      )
    },
    a({ node, ...props }) {
      return <a className="text-primary underline hover:text-primary/80" {...props} />
    },
    h1({ node, ...props }) {
      return <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
    },
    h2({ node, ...props }) {
      return <h2 className="text-xl font-semibold mt-3 mb-1.5" {...props} />
    },
    ul({ node, ...props }) {
      return <ul className="list-disc pl-6 my-2" {...props} />
    },
    ol({ node, ...props }) {
      return <ol className="list-decimal pl-6 my-2" {...props} />
    },
    blockquote({ node, ...props }) {
      return <blockquote className="border-l-4 border-muted pl-4 italic" {...props} />
    }
  }

  return (
    <div className="flex flex-col gap-2 mb-4 last:mb-2 group">
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        {!message.isUser && message.content === "Thinking..." ? (
          <ThinkingMessage />
        ) : (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 max-w-[85%]",
              "transition-all duration-200",
              "border border-border/50 backdrop-blur-sm",
              message.isUser
                ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
                : "bg-card/90 text-card-foreground shadow-md hover:shadow-lg",
              "hover:translate-y-[-1px]"
            )}
          >
            {message.snapshot && message.snapshot.segments ? (
              <div className="space-y-3">
                {message.snapshot.segments.map((segment, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      segment.content === "Thinking..." ? "animate-fade-in" : "animate-slide-in"
                    )}
                  >
                    {segment.content === "Thinking..." ? (
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="relative w-5 h-5">
                          <Sparkle className="w-5 h-5 absolute animate-spin text-primary" />
                          <div className="w-5 h-5 absolute animate-ping opacity-30 bg-primary rounded-full" />
                        </div>
                        <span className="text-primary font-medium animate-pulse">
                          Thinking...
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-line leading-relaxed text-[15px] animate-fade-in">
                          <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                            {segment.content}
                          </ReactMarkdown>
                        </p>
                        {segment.actions && segment.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 animate-slide-up">
                            {segment.actions.map(({ action, success, isExecuting }, j) => (
                              <ActionBadge 
                                key={j} 
                                action={action} 
                                success={success}
                                isExecuting={isExecuting}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className={cn(
                  "whitespace-pre-line leading-relaxed text-[15px]",
                  !message.isUser && "animate-fade-in"
                )}>
                  {message.content}
                </p>
                {!message.isUser && message.snapshot?.action && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-slide-up">
                    {(Array.isArray(message.snapshot.action)
                      ? message.snapshot.action
                      : [message.snapshot.action]
                    ).map(({ action, success, isExecuting }, index) => (
                      <ActionBadge 
                        key={index} 
                        action={action} 
                        success={success}
                        isExecuting={isExecuting}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
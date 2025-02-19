import { MessageItemProps } from "../types";
import {
  PencilLine,
  MousePointerClick,
  Loader2,
  Sparkle,
  Check,
  XCircle,
  Globe,
  ArrowLeft,
  ArrowRight,
  Keyboard,
  Clock,
  LayoutGrid,
  MessageCircleQuestion,
  CheckCircle
} from "lucide-react";
import { Action } from "../types/api";
import { ThinkingMessage } from "./ThinkingMessage";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown'
import React from 'react';

const getActionConfig = (action: Action, content?: string) => {
  const config = {
    icon: MousePointerClick,
    bgColor: 'bg-gray-50 dark:bg-gray-500/10',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200/50 dark:border-gray-400/20',
    iconColor: 'text-gray-600 dark:text-gray-400',
    hoverBg: 'hover:bg-gray-100/80 dark:hover:bg-gray-500/20',
    shadowColor: 'shadow-gray-500/25',
    description: 'Unknown action'
  };

  switch (Object.keys(action)[0]) {
    case 'input':
      config.icon = PencilLine;
      config.bgColor = 'bg-blue-50 dark:bg-blue-500/10';
      config.textColor = 'text-blue-700 dark:text-blue-300';
      config.borderColor = 'border-blue-200/50 dark:border-blue-400/20';
      config.iconColor = 'text-blue-600 dark:text-blue-400';
      config.hoverBg = 'hover:bg-blue-100/80 dark:hover:bg-blue-500/20';
      config.shadowColor = 'shadow-blue-500/25';
      config.description = action.input!.description || `Input: ${action.input!.text}`;
      break;
    case 'click':
      config.icon = MousePointerClick;
      config.bgColor = 'bg-purple-50 dark:bg-purple-500/10';
      config.textColor = 'text-purple-700 dark:text-purple-300';
      config.borderColor = 'border-purple-200/50 dark:border-purple-400/20';
      config.iconColor = 'text-purple-600 dark:text-purple-400';
      config.hoverBg = 'hover:bg-purple-100/80 dark:hover:bg-purple-500/20';
      config.shadowColor = 'shadow-purple-500/25';
      config.description = action.click!.description || 'Click';
      break;
    case 'navigate':
      config.icon = Globe;
      config.bgColor = 'bg-green-50 dark:bg-green-500/10';
      config.textColor = 'text-green-700 dark:text-green-300';
      config.borderColor = 'border-green-200/50 dark:border-green-400/20';
      config.iconColor = 'text-green-600 dark:text-green-400';
      config.hoverBg = 'hover:bg-green-100/80 dark:hover:bg-green-500/20';
      config.shadowColor = 'shadow-green-500/25';
      config.description = action.navigate!.description || `Navigate to: ${action.navigate!.url}`;
      break;
    case 'switch_tab':
      config.icon = LayoutGrid;
      config.bgColor = 'bg-orange-50 dark:bg-orange-500/10';
      config.textColor = 'text-orange-700 dark:text-orange-300';
      config.borderColor = 'border-orange-200/50 dark:border-orange-400/20';
      config.iconColor = 'text-orange-600 dark:text-orange-400';
      config.hoverBg = 'hover:bg-orange-100/80 dark:hover:bg-orange-500/20';
      config.shadowColor = 'shadow-orange-500/25';
      config.description = action.switch_tab!.description || 'Switch Tab';
      break;
    case 'back':
      config.icon = ArrowLeft;
      config.bgColor = 'bg-yellow-50 dark:bg-yellow-500/10';
      config.textColor = 'text-yellow-700 dark:text-yellow-300';
      config.borderColor = 'border-yellow-200/50 dark:border-yellow-400/20';
      config.iconColor = 'text-yellow-600 dark:text-yellow-400';
      config.hoverBg = 'hover:bg-yellow-100/80 dark:hover:bg-yellow-500/20';
      config.shadowColor = 'shadow-yellow-500/25';
      config.description = action.back!.description || 'Go Back';
      break;
    case 'forward':
      config.icon = ArrowRight;
      config.bgColor = 'bg-cyan-50 dark:bg-cyan-500/10';
      config.textColor = 'text-cyan-700 dark:text-cyan-300';
      config.borderColor = 'border-cyan-200/50 dark:border-cyan-400/20';
      config.iconColor = 'text-cyan-600 dark:text-cyan-400';
      config.hoverBg = 'hover:bg-cyan-100/80 dark:hover:bg-cyan-500/20';
      config.shadowColor = 'shadow-cyan-500/25';
      config.description = action.forward!.description || 'Go Forward';
      break;
    case 'keyboard':
      config.icon = Keyboard;
      config.bgColor = 'bg-pink-50 dark:bg-pink-500/10';
      config.textColor = 'text-pink-700 dark:text-pink-300';
      config.borderColor = 'border-pink-200/50 dark:border-pink-400/20';
      config.iconColor = 'text-pink-600 dark:text-pink-400';
      config.hoverBg = 'hover:bg-pink-100/80 dark:hover:bg-pink-500/20';
      config.shadowColor = 'shadow-pink-500/25';
      config.description = action.keyboard!.description || `Press: ${action.keyboard!.keys}`;
      break;
    case 'wait':
      config.icon = Clock;
      config.bgColor = 'bg-gray-50 dark:bg-gray-500/10';
      config.textColor = 'text-gray-700 dark:text-gray-300';
      config.borderColor = 'border-gray-200/50 dark:border-gray-400/20';
      config.iconColor = 'text-gray-600 dark:text-gray-400';
      config.hoverBg = 'hover:bg-gray-100/80 dark:hover:bg-gray-500/20';
      config.shadowColor = 'shadow-gray-500/25';
      config.description = action.wait!.description || `Wait for ${action.wait!.duration}ms`;
      break;
    case 'ask':
      config.icon = MessageCircleQuestion;
      config.bgColor = 'bg-purple-50 dark:bg-purple-500/10';
      config.textColor = 'text-purple-700 dark:text-purple-300';
      config.description = content || 'Question for user';
      break;
    case 'done':
      config.icon = CheckCircle;
      config.bgColor = 'bg-green-50 dark:bg-green-500/10';
      config.textColor = 'text-green-700 dark:text-green-300';
      config.description = content || 'Task completed';
      break;
  }

  return config;
};

const ActionBadge = ({ 
  action, 
  isExecuting,
  success,
  className,
  messageContent
}: { 
  action: Action;
  isExecuting?: boolean;
  success?: boolean;
  className?: string;
  messageContent?: string;
}) => {
  const config = getActionConfig(action, messageContent);
  const Icon = config.icon;
  
  const isCompletionAction = 'done' in action || 'ask' in action;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        "rounded-lg border transition-all duration-200",
        "w-full",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <Icon className={cn(
          "w-5 h-5 transition-transform duration-200 flex-shrink-0",
          config.iconColor,
          "group-hover/action:scale-110"
        )} />
        <span className={cn(
          "text-sm font-medium flex-1",
          "transition-colors duration-200"
        )}>
          {config.description}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {isExecuting ? (
          <Loader2 className={cn("w-5 h-5 animate-spin", config.iconColor)} />
        ) : null}
        {!isCompletionAction && success !== undefined && (
          success ? 
            <Check className="w-5 h-5 text-green-500 dark:text-green-400 animate-fade-scale" /> :
            <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 animate-fade-scale" />
        )}
      </div>
    </div>
  );
};

const MessageBubble = ({
  content,
  actions,
  isUser,
  isThinking
}: {
  content: string;
  actions?: Array<{
    action: Action;
    success?: boolean;
    isExecuting?: boolean;
  }>;
  isUser: boolean;
  isThinking?: boolean;
}) => {
  // Vérifier si on a des actions de fin
  const hasCompletionAction = actions?.some(({ action }) => 
    'ask' in action || 'done' in action
  );

  if (isThinking) {
    return (
      <div className={cn(
        "rounded-2xl px-3 py-2",
        "bg-card/90 text-card-foreground",
        "border border-border/50 backdrop-blur-sm",
        "shadow-md",
        "flex items-center gap-2.5"
      )}>
        <div className="relative w-5 h-5">
          <Sparkle className="w-5 h-5 absolute animate-spin text-primary" />
          <div className="w-5 h-5 absolute animate-ping opacity-30 bg-primary rounded-full" />
        </div>
        <span className="text-primary font-medium animate-pulse">
          Thinking...
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-2xl px-3 py-2",
        "transition-all duration-200",
        "border border-border/50 backdrop-blur-sm",
        isUser
          ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
          : "bg-card/90 text-card-foreground shadow-md hover:shadow-lg",
        "hover:translate-y-[-1px]",
        "max-w-[85%]"
      )}
    >
      {/* Masquer le contenu si on a des actions de fin */}
      {!hasCompletionAction && (
        <p className={cn(
          "whitespace-pre-line leading-relaxed text-[15px]",
          !isUser && "animate-fade-in"
        )}>
          <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
            {content}
          </ReactMarkdown>
        </p>
      )}
      
      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 animate-slide-up">
          {actions.map(({ action, success, isExecuting }, index) => (
            <ActionBadge
              key={index}
              action={action}
              success={success}
              isExecuting={isExecuting}
              className="w-full"
              messageContent={content}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className="flex flex-col mb-3 last:mb-2 group">
      <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} gap-2`}>
        {message.snapshot?.segments ? (
          message.snapshot.segments.map((segment, index) => (
            <MessageBubble
              key={index}
              content={segment.content}
              actions={segment.actions}
              isUser={message.isUser}
              isThinking={segment.content === "Thinking..."}
            />
          ))
        ) : (
          <MessageBubble
            content={message.content}
            actions={message.snapshot?.action?.map(action => ({ action }))}
            isUser={message.isUser}
          />
        )}
      </div>
    </div>
  );
}
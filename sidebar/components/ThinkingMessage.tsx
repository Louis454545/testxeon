import React from 'react';
import { Sparkle } from 'lucide-react';
import { Message, createMessage } from '../types';
import { cn } from '../../lib/utils';

export interface ThinkingMessageProps {
  className?: string;
}

export function ThinkingMessage({ className }: ThinkingMessageProps) {
  return (
    <div className={cn("flex items-center gap-2 py-2", className)}>
      <Sparkle className="w-5 h-5 animate-spin text-primary" />
      <span>Thinking...</span>
    </div>
  );
}

// Keep the message creation function for use in the app logic
export function createThinkingMessage(): Message {
  return createMessage("Thinking...", false);
}
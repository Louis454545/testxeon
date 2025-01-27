import { Message, createMessage } from '../types'

export interface ThinkingMessageProps {
  isVisible: boolean;
}

export function ThinkingMessage({ isVisible }: ThinkingMessageProps): Message | null {
  if (!isVisible) return null;
  return createMessage("Thinking...", false);
}

export function createThinkingMessage(): Message {
  return createMessage("Thinking...", false);
}
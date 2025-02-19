import type { ApiResponse, Action } from './api';

interface MessageSegment {
  content: string;
  actions: Array<{
    action: Action;
    success?: boolean;
    isExecuting?: boolean;
  }>;
}

/**
 * Represents a message in the chat interface
 */
export interface Message {
  /** The text content of the message */
  content: string;
  
  /** Whether the message is from the user (true) or the assistant (false) */
  isUser: boolean;
  
  /** When the message was sent */
  timestamp: Date;
  
  /** Temporary ID for messages in progress */
  tempId?: number;
  
  /** Response data from the API */
  snapshot?: {
    action?: Action[];
    content?: string;
    message?: string;
    conversation_id?: string;
    segments?: MessageSegment[];
  };
}

/**
 * Helper function to create a new message with proper role
 */
export function createMessage(
  content: string,
  isUser: boolean,
  snapshot?: ApiResponse
): Message {
  return {
    content,
    isUser,
    timestamp: new Date(),
    snapshot
  };
}

/**
 * Conversation metadata and messages
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string;
  
  /** Display title */
  title: string;
  
  /** All messages in the conversation */
  messages: Message[];
  
  /** Last time the conversation was modified */
  lastUpdated: Date;
  
  /** Short preview of the last message */
  preview: string;
}

/**
 * Props for the MessageList component
 */
export interface MessageListProps {
  messages: Message[];
}

/**
 * Props for the MessageInput component
 */
export interface MessageInputProps {
  /** Callback when a message is submitted */
  onSubmit: (message: string) => Promise<void>;
  /** Whether a message is currently being sent */
  isSending: boolean;
  /** Optional callback to cancel the sending process */
  onCancel?: () => void;
}

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Callback to start a new conversation */
  onNewConversation: () => void;
  /** Callback to view conversation list */
  onViewConversations: () => void;
  /** Callback to view settings */
  onViewSettings: () => void;
}

/**
 * Props for the MessageItem component
 */
export interface MessageItemProps {
  /** Message to display */
  message: Message;
}

/**
 * Props for the ConversationsPage component
 */
export interface ConversationsPageProps {
  /** List of all conversations */
  conversations: Conversation[];
  /** Callback when a conversation is selected */
  onSelectConversation: (id: string) => void;
  /** Callback when search input changes */
  onSearch: (query: string) => void;
  /** Callback when a conversation is deleted */
  onDeleteConversation: (id: string) => void;
}
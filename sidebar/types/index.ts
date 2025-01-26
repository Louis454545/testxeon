export interface Message {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  snapshot?: any;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  preview: string;
}

export interface MessageListProps {
  messages: Message[];
}

export interface MessageInputProps {
  onSubmit: (message: string, snapshot?: any) => void;
  isSending: boolean;
}

export interface HeaderProps {
  onNewConversation: () => void;
  onViewConversations: () => void;
}

export interface MessageItemProps {
  message: Message;
}

export interface ConversationsPageProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onSearch: (query: string) => void;
  onDeleteConversation: (id: string) => void;
}
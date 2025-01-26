export interface Message {
  content: string;
  isUser: boolean;
}

export interface MessageListProps {
  messages: Message[];
}

export interface MessageInputProps {
  onSubmit: (message: string) => void;
  isSending: boolean;
}

export interface HeaderProps {
  onNewConversation: () => void;
}

export interface MessageItemProps {
  message: Message;
}
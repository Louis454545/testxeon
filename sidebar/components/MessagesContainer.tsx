import { useState } from "react";
import { Message } from "../types";
import { MessageHandler } from "./MessageHandler";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Card } from "@/components/ui/card";

interface MessagesContainerProps {
  initialMessages?: Message[];
  task?: string;
}

export function MessagesContainer({ initialMessages = [], task }: MessagesContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (content: string) => {
    try {
      setIsSending(true);
      
      // Add user message immediately
      const userMessage: Message = {
        content,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Process message through MessageHandler
      const response = await MessageHandler.processMessage(
        content,
        task,
        messages
      );

      // Add response message
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        content: 'Sorry, there was an error processing your request.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSubmit={handleSubmit} isSending={isSending} />
    </Card>
  );
}
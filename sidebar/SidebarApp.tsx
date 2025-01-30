import { useState } from "react"
import { Header } from "./components/Header"
import { MessageList } from "./components/MessageList"
import { MessageInput } from "./components/MessageInput"
import { ConversationsPage } from "./components/ConversationsPage"
import { Message, Conversation, createMessage } from "./types"
import { MessageHandler } from "./components/MessageHandler"
import { DebuggerConnectionService } from "./utils/debuggerConnection"
import { createThinkingMessage } from "./components/ThinkingMessage"
import { PageCaptureService } from "./utils/pageCapture"
import './styles.css'

type View = 'chat' | 'conversations';

export default function SidebarApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [currentView, setCurrentView] = useState<View>('chat')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const handleNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setCurrentView('chat')
  }

  const handleViewConversations = () => {
    if (currentConversationId && messages.length > 0) {
      updateConversation(currentConversationId, messages)
    } else if (!currentConversationId && messages.length > 0) {
      createNewConversation(messages)
    }
    setCurrentView('conversations')
  }

  const createNewConversation = (msgs: Message[]) => {
    if (msgs.length === 0) return
    
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: `Conversation ${conversations.length + 1}`,
      messages: msgs,
      lastUpdated: new Date(),
      preview: msgs[msgs.length - 1]?.content || ""
    }
    setConversations([...conversations, newConversation])
    setCurrentConversationId(newId)
  }

  const updateConversation = (id: string, newMessages: Message[]) => {
    if (newMessages.length === 0) {
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.id !== id)
      )
      return
    }

    setConversations(prevConversations => 
      prevConversations.map(conv => {
        if (conv.id === id) {
          return {
            ...conv,
            messages: newMessages,
            lastUpdated: new Date(),
            preview: newMessages[newMessages.length - 1]?.content || "",
          }
        }
        return conv
      })
    )
  }

  const handleSubmitMessage = async (content: string) => {
    setIsSending(true)
    
    // Create and display user message immediately
    const userMessage = createMessage(content, true);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (currentConversationId) {
      updateConversation(currentConversationId, updatedMessages);
    } else {
      createNewConversation(updatedMessages);
    }
    
    try {
      // Show thinking message
      const thinkingMessage = createThinkingMessage();
      const messagesWithThinking = [...updatedMessages, thinkingMessage];
      setMessages(messagesWithThinking);
      
      if (currentConversationId) {
        updateConversation(currentConversationId, messagesWithThinking);
      }

      // Get API response
      const [apiResponse, page, browser] = await MessageHandler.getApiResponse(
        content,
        updatedMessages
      );

      try {
        // Create message with the API response content or default message
        const initialContent = apiResponse.content || "Executing action...";

        // Execute action if present and stop processing
        if (apiResponse.action) {
          const actionSuccess = await MessageHandler.executeAction(page, apiResponse);
          window.lastActionSuccess = actionSuccess;

          // Create final message with action result
          const messageWithAction = createMessage(initialContent, false, apiResponse);
          const finalMessages = [...updatedMessages, messageWithAction];
          setMessages(finalMessages);
          
          if (currentConversationId) {
            updateConversation(currentConversationId, finalMessages);
          }
          return; // Stop here after executing any action
        }

        // If no action, just show the message
        const finalMessage = createMessage(initialContent, false, apiResponse);
        const finalMessages = [...updatedMessages, finalMessage];
        setMessages(finalMessages);
        
        if (currentConversationId) {
          updateConversation(currentConversationId, finalMessages);
        }

      } finally {
        await DebuggerConnectionService.disconnect(browser);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = createMessage(content, true, {
        content: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const finalMessages = updatedMessages.map(msg =>
        msg === userMessage ? errorMessage : msg
      );
      setMessages(finalMessages);

      if (currentConversationId) {
        updateConversation(currentConversationId, finalMessages);
      }
    } finally {
      setIsSending(false);
    }
  }

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id)
    if (conversation) {
      setMessages(conversation.messages)
      setCurrentConversationId(id)
      setCurrentView('chat')
    }
  }

  const handleDeleteConversation = (id: string) => {
    setConversations(prevConversations => 
      prevConversations.filter(conv => conv.id !== id)
    )

    if (id === currentConversationId) {
      setMessages([])
      setCurrentConversationId(null)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full dark flex flex-col">
      <Header 
        onNewConversation={handleNewConversation}
        onViewConversations={handleViewConversations}
      />
      {currentView === 'chat' ? (
        <>
          <MessageList messages={messages} />
          <MessageInput 
            onSubmit={handleSubmitMessage}
            isSending={isSending}
          />
        </>
      ) : (
        <ConversationsPage
          conversations={filteredConversations}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onSearch={handleSearch}
        />
      )}
    </div>
  )
}

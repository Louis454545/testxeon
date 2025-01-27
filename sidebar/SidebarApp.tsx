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
    // Just clear messages without creating a conversation
    setMessages([])
    setCurrentConversationId(null)
    setCurrentView('chat')
  }

  const handleViewConversations = () => {
    // Save current conversation only if it has messages
    if (currentConversationId && messages.length > 0) {
      updateConversation(currentConversationId, messages)
    } else if (!currentConversationId && messages.length > 0) {
      // Create new conversation if there are messages but no ID
      createNewConversation(messages)
    }
    setCurrentView('conversations')
  }

  const createNewConversation = (msgs: Message[]) => {
    if (msgs.length === 0) return // Don't create empty conversations
    
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
      // Remove conversation if it becomes empty
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
    
    // Update or create conversation
    if (currentConversationId) {
      updateConversation(currentConversationId, updatedMessages);
    } else {
      createNewConversation(updatedMessages);
    }
    
    try {
      // Show thinking message first
      const thinkingMessage = createThinkingMessage();
      const messagesWithThinking = [...updatedMessages, thinkingMessage];
      setMessages(messagesWithThinking);
      
      // Update conversation with thinking state
      if (currentConversationId) {
        updateConversation(currentConversationId, messagesWithThinking);
      }

      // Get API response
      const [apiResponse, page, browser] = await MessageHandler.getApiResponse(
        content,
        updatedMessages // Pass history including current user message
      );

      // Show API response message
      const apiMessage = createMessage(apiResponse.message, false, apiResponse);
      const messagesWithResponse = [...updatedMessages, apiMessage];
      setMessages(messagesWithResponse);
      
      // Update conversation with API response
      if (currentConversationId) {
        updateConversation(currentConversationId, messagesWithResponse);
      }

      // Execute action after showing both messages
      try {
        await MessageHandler.executeAction(page, apiResponse);
        
        // Keep processing followup responses until no more actions
        let currentMessages = messagesWithResponse;
        let lastResponse = apiResponse;
        
        while (lastResponse.action) {
          // Show thinking message for followup
          const followupThinkingMessage = createThinkingMessage();
          const messagesWithFollowupThinking = [...currentMessages, followupThinkingMessage];
          setMessages(messagesWithFollowupThinking);
          
          // Update conversation with thinking state
          if (currentConversationId) {
            updateConversation(currentConversationId, messagesWithFollowupThinking);
          }

          // Get new page data after action execution
          const pageData = await PageCaptureService.capturePageData(page);
          
          // Send another request with updated context
          const followupResponse = await MessageHandler.sendApiRequest(
            pageData.accessibility,
            pageData.screenshot,
            [...currentMessages]
          );
          
          // Create and add the followup message
          const followupMessage = createMessage(followupResponse.message, false, followupResponse);
          currentMessages = [...currentMessages, followupMessage];
          setMessages(currentMessages);
          
          // Update conversation if needed
          if (currentConversationId) {
            updateConversation(currentConversationId, currentMessages);
          }

          // Execute any actions from the followup response
          if (followupResponse.action) {
            await MessageHandler.executeAction(page, followupResponse);
          }

          lastResponse = followupResponse;
        }
        
      } finally {
        await DebuggerConnectionService.disconnect(browser);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Update the user message with error state
      const errorMessage = createMessage(content, true, {
        message: 'Failed to process message',
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

    // If we're deleting the current conversation, clear the current state
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

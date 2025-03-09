import { useState, useRef, useEffect } from "react"
import { Header } from "./components/Header"
import { MessageList } from "./components/MessageList"
import { MessageInput } from "./components/MessageInput"
import { ConversationsPage } from "./components/ConversationsPage"
import { SettingsPage } from "./components/SettingsPage"
import { Message, Conversation, createMessage } from "./types"
import { MessageHandler } from "./components/MessageHandler"
import './styles.css'
import { UnsupportedUrlView } from "./components/UnsupportedUrlView"

type View = 'chat' | 'conversations' | 'settings';
type Theme = 'light' | 'dark' | 'system';

export default function SidebarApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [currentView, setCurrentView] = useState<View>('chat')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isSupportedUrl, setIsSupportedUrl] = useState(true)

  // Reference to handle the cancellation of the sending process
  const cancelSending = useRef<() => void | null>(null);

  useEffect(() => {
    // Initialize theme from storage on mount
    chrome.storage.local.get('theme', (result) => {
      const savedTheme = result.theme ?? 'system'
      if (savedTheme === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.className = isDarkMode ? 'dark' : ''
      } else {
        document.documentElement.className = savedTheme === 'dark' ? 'dark' : ''
      }
    })
  }, [])

  useEffect(() => {
    const checkUrl = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab?.url || '';
        const allowedProtocols = ['http:', 'https:', 'file:'];
        setIsSupportedUrl(allowedProtocols.some(p => url.startsWith(p)));
      } catch (error) {
        console.error('Error checking URL:', error);
        setIsSupportedUrl(false);
      }
    };

    checkUrl();
    const interval = setInterval(checkUrl, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelMessage = () => {
    if (isSending) {
      cancelSending.current?.();
      cancelSending.current = null;
      setIsSending(false);
    }
  }

  const handleNewConversation = () => {
    MessageHandler.closeConnection();
    setMessages([]);
    setCurrentConversationId(null);
    setCurrentView('chat');
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

  const handleViewSettings = () => {
    setCurrentView('settings')
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
    const abortController = new AbortController();
    cancelSending.current = () => abortController.abort();

    setIsSending(true);

    // Add user message
    const userMessage: Message = {
      content,
      isUser: true,
      timestamp: new Date(),
    };
    const baseMessages = [...messages, userMessage];
    setMessages(baseMessages);
    if (currentConversationId) {
      updateConversation(currentConversationId, baseMessages);
    } else {
      createNewConversation(baseMessages);
    }

    // Create assistant message with segment structure
    let assistantMessage = createMessage("", false);
    assistantMessage.tempId = Date.now();
    assistantMessage.snapshot = { segments: [{ content: "Thinking...", actions: [] }] };
    let newMessages = [...baseMessages, assistantMessage];
    setMessages(newMessages);
    if (currentConversationId) updateConversation(currentConversationId, newMessages);

    try {
      const [apiResponse, page, browser] = await MessageHandler.getApiResponse(
        content,
        null,
        [],
        abortController
      );
      
      // Immediately check for final actions
      const isFinalAction = apiResponse.action?.some(a => 
        'done' in a || 'ask' in a
      );

      // Update the message
      const messageContent = apiResponse.message || apiResponse.content;
      assistantMessage.content = messageContent;
      
      if (isFinalAction) {
        assistantMessage.snapshot = {
          segments: [{
            content: messageContent,
            actions: apiResponse.action.map(action => ({ action }))
          }]
        };
        setMessages([...baseMessages, assistantMessage]);
        setIsSending(false);
        return;
      }

      // Replace "Thinking..." segment with actual response
      if (assistantMessage.snapshot?.segments) {
        assistantMessage.snapshot.segments[0] = {
          content: messageContent,
          actions: apiResponse.action.map(action => ({
            action,
            isExecuting: false,
            success: undefined
          }))
        };
        setMessages([...baseMessages, assistantMessage]);
      }

      // Sequential execution of actions with state updates
      let actionResults = [];
      if (page && assistantMessage.snapshot?.segments?.[0]) {
        // Initialize action array with default values
        assistantMessage.snapshot.segments[0].actions = apiResponse.action.map(action => ({
          action,
          isExecuting: false,
          success: undefined
        }));
        setMessages([...baseMessages, assistantMessage]);

        for (let i = 0; i < apiResponse.action.length; i++) {
          const action = apiResponse.action[i];
          // Update isExecuting state
          assistantMessage.snapshot.segments[0].actions[i].isExecuting = true;
          setMessages([...baseMessages, assistantMessage]);
          
          const result = await MessageHandler.executeSingleAction(page, action);
          actionResults.push(result);
          
          // Update success state for completed action
          assistantMessage.snapshot.segments[0].actions[i].isExecuting = false;
          assistantMessage.snapshot.segments[0].actions[i].success = result.success;
          setMessages([...baseMessages, assistantMessage]);
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Follow-up loop
      let lastResponse = apiResponse;
      while (!abortController.signal.aborted && lastResponse.action && lastResponse.action.length > 0) {
        // Check if new response contains a final action
        const hasCompletion = lastResponse.action.some(a => 
          'done' in a || 'ask' in a
        );
        if (hasCompletion) {
          break; // Exit loop immediately
        }

        // Add new "Thinking..." segment for follow-up
        if (assistantMessage.snapshot?.segments) {
          assistantMessage.snapshot.segments.push({ content: "Thinking...", actions: [] });
        }
        newMessages = [...baseMessages, assistantMessage];
        setMessages(newMessages);
        if (currentConversationId) updateConversation(currentConversationId, newMessages);

        const [followupResponse] = await MessageHandler.getApiResponse(
          undefined, 
          page, 
          actionResults
        );
        
        if (abortController.signal.aborted) break;

        // Replace last "Thinking..." with response with actions
        const followupContent = followupResponse.message || followupResponse.content;
        if (assistantMessage.snapshot?.segments) {
          const lastSegmentIndex = assistantMessage.snapshot.segments.length - 1;
          assistantMessage.snapshot.segments[lastSegmentIndex] = {
            content: followupContent,
            actions: followupResponse.action.map(action => ({
              action,
              isExecuting: false
            }))
          };
          assistantMessage.content = followupContent;

          // Sequential execution of new actions with state updates
          let followupResults = [];
          if (page) {
            for (let i = 0; i < followupResponse.action.length; i++) {
              const action = followupResponse.action[i];
              // Update isExecuting state for current action
              assistantMessage.snapshot.segments[lastSegmentIndex].actions[i].isExecuting = true;
              setMessages([...baseMessages, assistantMessage]);
              
              const result = await MessageHandler.executeSingleAction(page, action);
              followupResults.push(result);
              
              // Update success state for completed action
              assistantMessage.snapshot.segments[lastSegmentIndex].actions[i].isExecuting = false;
              assistantMessage.snapshot.segments[lastSegmentIndex].actions[i].success = result.success;
              setMessages([...baseMessages, assistantMessage]);
              
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          lastResponse = followupResponse;
          actionResults = followupResults;
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.content === "" && lastMessage?.snapshot?.segments?.[0]?.content === "Thinking...") {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } else {
        console.error('Error processing message:', error);
        if (assistantMessage.snapshot?.segments) {
          assistantMessage.snapshot.segments.push({
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            actions: []
          });
          newMessages = [...baseMessages, assistantMessage];
          setMessages(newMessages);
        }
        if (currentConversationId) updateConversation(currentConversationId, newMessages);
      }
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="h-full flex flex-col">
      {isSupportedUrl ? (
        <>
          <Header 
            onNewConversation={handleNewConversation}
            onViewConversations={handleViewConversations}
            onViewSettings={handleViewSettings}
          />
          {currentView === 'chat' ? (
            <>
              <MessageList messages={messages} />
              <MessageInput 
                onSubmit={handleSubmitMessage}
                isSending={isSending}
                onCancel={handleCancelMessage}
              />
            </>
          ) : currentView === 'conversations' ? (
            <ConversationsPage
              conversations={filteredConversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onSearch={handleSearch}
            />
          ) : (
            <SettingsPage />
          )}
        </>
      ) : (
        <UnsupportedUrlView onRedirect={() => {
          chrome.tabs.update({ url: 'https://www.google.com' });
        }} />
      )}
    </div>
  )
}

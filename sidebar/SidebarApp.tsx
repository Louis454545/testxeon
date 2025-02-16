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

  // Référence pour gérer l'annulation du processus d'envoi
  const cancelSending = useRef(false);

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
      cancelSending.current = true
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
    cancelSending.current = false;
    setIsSending(true);

    // Ajoute le message utilisateur
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

    // Crée un message assistant avec une structure de segments
    let assistantMessage = createMessage("", false);
    assistantMessage.snapshot = { segments: [{ content: "Thinking...", actions: [] }] };
    let newMessages = [...baseMessages, assistantMessage];
    setMessages(newMessages);
    if (currentConversationId) updateConversation(currentConversationId, newMessages);

    try {
      const [apiResponse, page, browser] = await MessageHandler.getApiResponse(content);
      
      // Met à jour le premier segment avec la réponse
      assistantMessage.snapshot!.segments[0] = {
        content: apiResponse.content,
        actions: apiResponse.action.map(action => ({
          action,
          success: undefined,
          isExecuting: true
        }))
      };
      newMessages = [...baseMessages, assistantMessage];
      setMessages(newMessages);
      if (currentConversationId) updateConversation(currentConversationId, newMessages);
      
      // Exécution séquentielle des actions
      let actionResults = [];
      for (const [index, action] of apiResponse.action.entries()) {
        // Met à jour l'état d'exécution pour cette action uniquement
        assistantMessage.snapshot!.segments[0].actions[index].isExecuting = true;
        newMessages = [...baseMessages, assistantMessage];
        setMessages(newMessages);
        
        // Exécute l'action une par une
        const result = await MessageHandler.executeSingleAction(page, action);
        actionResults.push(result);
        
        // Met à jour le résultat immédiatement
        assistantMessage.snapshot!.segments[0].actions[index] = {
          action,
          success: result.content.includes("succès"),
          isExecuting: false
        };
        newMessages = [...baseMessages, assistantMessage];
        setMessages(newMessages);
        if (currentConversationId) updateConversation(currentConversationId, newMessages);
        
        // Pause visuelle entre les actions
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Boucle de suivi
      let lastResponse = apiResponse;
      while (!cancelSending.current && lastResponse.action && lastResponse.action.length > 0) {
        // Ajoute un nouveau segment "Thinking..." pour le follow-up
        assistantMessage.snapshot!.segments.push({ content: "Thinking...", actions: [] });
        newMessages = [...baseMessages, assistantMessage];
        setMessages(newMessages);
        if (currentConversationId) updateConversation(currentConversationId, newMessages);

        const [followupResponse] = await MessageHandler.getApiResponse(
          undefined, 
          page, 
          actionResults
        );
        
        if (cancelSending.current) break;

        // Remplace le dernier "Thinking..." par la réponse
        assistantMessage.snapshot!.segments[assistantMessage.snapshot!.segments.length - 1] = {
          content: followupResponse.content,
          actions: followupResponse.action.map(action => ({
            action,
            success: undefined,
            isExecuting: true
          }))
        };
        newMessages = [...baseMessages, assistantMessage];
        setMessages(newMessages);
        if (currentConversationId) updateConversation(currentConversationId, newMessages);
        
        // Exécution séquentielle des nouvelles actions
        let followupResults = [];
        for (const [index, action] of followupResponse.action.entries()) {
          const lastSegment = assistantMessage.snapshot!.segments[assistantMessage.snapshot!.segments.length - 1];
          lastSegment.actions[index].isExecuting = true;
          newMessages = [...baseMessages, assistantMessage];
          setMessages(newMessages);
          
          const result = await MessageHandler.executeSingleAction(page, action);
          followupResults.push(result);
          
          lastSegment.actions[index] = {
            action,
            success: result.content.includes("succès"),
            isExecuting: false
          };
          newMessages = [...baseMessages, assistantMessage];
          setMessages(newMessages);
          if (currentConversationId) updateConversation(currentConversationId, newMessages);
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        lastResponse = followupResponse;
        actionResults = followupResults;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      assistantMessage.snapshot!.segments.push({
        content: `Erreur : ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        actions: []
      });
      newMessages = [...baseMessages, assistantMessage];
      setMessages(newMessages);
      if (currentConversationId) updateConversation(currentConversationId, newMessages);
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

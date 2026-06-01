import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { MessageInput } from "./components/MessageInput";
import { ConversationsPage } from "./components/ConversationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { RunsPage } from "./components/RunsPage";
import { UnsupportedUrlView } from "./components/UnsupportedUrlView";
import { AgentStatusPanel } from "./components/AgentStatusPanel";
import type { Conversation, Message } from "./types";
import {
  deleteConversation,
  listConversations,
  saveConversationMessages,
} from "../src/storage/conversations";
import type { AgentRun, ChatMessage } from "../src/shared/types";
import "./styles.css";

type View = "chat" | "conversations" | "runs" | "settings";

export default function SidebarApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentView, setCurrentView] = useState<View>("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => crypto.randomUUID());
  const [isSupportedUrl, setIsSupportedUrl] = useState(true);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chrome.storage.local.get("theme", (result) => {
      const savedTheme = result.theme ?? "system";
      if (savedTheme === "system") {
        document.documentElement.className = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "";
      } else {
        document.documentElement.className = savedTheme === "dark" ? "dark" : "";
      }
    });
  }, []);

  useEffect(() => {
    refreshConversations();
  }, []);

  useEffect(() => {
    const checkUrl = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tab?.url || "";
        setIsSupportedUrl(["http:", "https:", "file:"].some((protocol) => url.startsWith(protocol)));
      } catch {
        setIsSupportedUrl(false);
      }
    };

    checkUrl();
    const interval = window.setInterval(checkUrl, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conversation.preview.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const refreshConversations = async () => {
    const stored = await listConversations();
    setConversations(
      stored.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages.map(fromStoredMessage),
        lastUpdated: new Date(conversation.lastUpdated),
        preview: conversation.preview,
      })),
    );
  };

  const handleCancelMessage = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSending(false);
  };

  const handleNewConversation = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setActiveRun(null);
    setCurrentConversationId(crypto.randomUUID());
    setCurrentView("chat");
  };

  const persistMessages = async (conversationId: string, nextMessages: Message[]) => {
    if (nextMessages.length === 0) return;
    await saveConversationMessages(conversationId, nextMessages.map(toStoredMessage));
    await refreshConversations();
  };

  const handleSubmitMessage = async (content: string) => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsSending(true);
    setActiveRun(null);

    const conversationId = currentConversationId || crypto.randomUUID();
    setCurrentConversationId(conversationId);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      content: "Thinking...",
      isUser: false,
      timestamp: new Date(),
      snapshot: {
        segments: [{ content: "Thinking...", actions: [], status: "thinking" }],
      },
    };

    const baseMessages = [...messages, userMessage, assistantMessage];
    setMessages(baseMessages);
    await persistMessages(conversationId, baseMessages);

    const updateAssistantFromRun = (run: AgentRun) => {
      setActiveRun(run);
      setMessages((current) => {
        const next = current.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                runId: run.id,
                content: getRunDisplayContent(run),
                snapshot: { segments: run.steps },
              }
            : message,
        );
        return next;
      });
    };

    try {
      const { AgentRunner } = await import("../src/agent/AgentRunner");
      const run = await new AgentRunner().run(
        content,
        {
          conversationId,
          previousMessages: messages.map(toStoredMessage),
          onRunUpdate: updateAssistantFromRun,
        },
        abortController.signal,
      );

      const finalMessages = baseMessages.map((message) =>
        message.id === assistantMessage.id
          ? {
              ...message,
              runId: run.id,
              content: getRunDisplayContent(run),
              snapshot: { segments: run.steps },
            }
          : message,
      );
      setActiveRun(run);
      setMessages(finalMessages);
      await persistMessages(conversationId, finalMessages);
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((candidate) => candidate.id === id);
    if (!conversation) return;
    setMessages(conversation.messages);
    setCurrentConversationId(id);
    setCurrentView("chat");
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (id === currentConversationId) {
      setMessages([]);
      setCurrentConversationId(crypto.randomUUID());
    }
    await refreshConversations();
  };

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {isSupportedUrl ? (
        <>
          <Header
            activeView={currentView}
            onNewConversation={handleNewConversation}
            onViewChat={() => setCurrentView("chat")}
            onViewConversations={() => setCurrentView("conversations")}
            onViewRuns={() => setCurrentView("runs")}
            onViewSettings={() => setCurrentView("settings")}
          />
          {currentView === "chat" ? (
            <>
              <AgentStatusPanel run={activeRun} isSending={isSending} />
              <MessageList messages={messages} />
              <MessageInput
                onSubmit={handleSubmitMessage}
                isSending={isSending}
                onCancel={handleCancelMessage}
              />
            </>
          ) : currentView === "conversations" ? (
            <ConversationsPage
              conversations={filteredConversations}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onSearch={setSearchQuery}
            />
          ) : currentView === "runs" ? (
            <RunsPage />
          ) : (
            <SettingsPage />
          )}
        </>
      ) : (
        <UnsupportedUrlView
          onRedirect={() => {
            chrome.tabs.update({ url: "https://www.google.com" });
          }}
        />
      )}
    </div>
  );
}

function toStoredMessage(message: Message): ChatMessage {
  return {
    id: message.id || crypto.randomUUID(),
    content: message.content,
    isUser: message.isUser,
    timestamp:
      message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : new Date(message.timestamp).toISOString(),
    runId: message.runId,
    segments: message.snapshot?.segments as ChatMessage["segments"],
  };
}

function fromStoredMessage(message: ChatMessage): Message {
  return {
    id: message.id,
    content: message.content,
    isUser: message.isUser,
    timestamp: new Date(message.timestamp),
    runId: message.runId,
    snapshot: message.segments ? { segments: message.segments } : undefined,
  };
}

function getRunDisplayContent(run: AgentRun): string {
  const done = run.steps
    .flatMap((step) => step.actions)
    .find(({ action }) => "done" in action)?.action;
  if (done && "done" in done) return done.done.message;

  const ask = run.steps
    .flatMap((step) => step.actions)
    .find(({ action }) => "ask" in action)?.action;
  if (ask && "ask" in ask) return ask.ask.query;

  if (run.error) return run.error;
  return [...run.steps].reverse().find((step) => step.message)?.message || "Done";
}

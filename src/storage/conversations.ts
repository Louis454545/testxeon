import type { ChatMessage, StoredConversation } from "../shared/types";

const CONVERSATIONS_KEY = "conversations.v2";
const LEGACY_CONVERSATIONS_KEY = "conversations";

export async function listConversations(): Promise<StoredConversation[]> {
  const data = await chrome.storage.local.get([CONVERSATIONS_KEY, LEGACY_CONVERSATIONS_KEY]);
  const current = data[CONVERSATIONS_KEY];

  if (Array.isArray(current)) {
    return current.map(normalizeConversation).sort(sortByLastUpdated);
  }

  const migrated = Array.isArray(data[LEGACY_CONVERSATIONS_KEY])
    ? data[LEGACY_CONVERSATIONS_KEY].map(migrateLegacyConversation)
    : [];
  await saveAllConversations(migrated);
  return migrated.sort(sortByLastUpdated);
}

export async function getConversation(id: string): Promise<StoredConversation | null> {
  const conversations = await listConversations();
  return conversations.find((conversation) => conversation.id === id) ?? null;
}

export async function upsertConversation(
  conversation: Omit<StoredConversation, "lastUpdated" | "preview"> & {
    lastUpdated?: string;
    preview?: string;
  },
): Promise<StoredConversation> {
  const conversations = await listConversations();
  const now = new Date().toISOString();
  const normalized: StoredConversation = normalizeConversation({
    ...conversation,
    lastUpdated: conversation.lastUpdated ?? now,
    preview: conversation.preview ?? getPreview(conversation.messages),
  });

  const next = [
    normalized,
    ...conversations.filter((existing) => existing.id !== normalized.id),
  ].sort(sortByLastUpdated);
  await saveAllConversations(next);
  return normalized;
}

export async function deleteConversation(id: string): Promise<void> {
  const conversations = await listConversations();
  await saveAllConversations(conversations.filter((conversation) => conversation.id !== id));
}

export async function saveConversationMessages(
  id: string,
  messages: ChatMessage[],
  title?: string,
): Promise<StoredConversation> {
  const existing = await getConversation(id);
  const now = new Date().toISOString();
  return upsertConversation({
    id,
    title: title || existing?.title || makeTitle(messages),
    createdAt: existing?.createdAt || now,
    lastUpdated: now,
    messages,
    preview: getPreview(messages),
  });
}

async function saveAllConversations(conversations: StoredConversation[]): Promise<void> {
  await chrome.storage.local.set({ [CONVERSATIONS_KEY]: conversations });
}

function migrateLegacyConversation(input: any): StoredConversation {
  const now = new Date().toISOString();
  const messages: ChatMessage[] = Array.isArray(input.messages)
    ? input.messages
        .filter((message: any) => message && typeof message.content === "string")
        .map((message: any) => ({
          id: crypto.randomUUID(),
          content: message.content,
          isUser: message.role ? message.role === "user" : Boolean(message.isUser),
          timestamp: normalizeDate(message.timestamp ?? input.lastUpdated ?? now),
        }))
    : [];

  return normalizeConversation({
    id: String(input.id || crypto.randomUUID()),
    title: input.title || makeTitle(messages),
    messages,
    createdAt: normalizeDate(input.createdAt ?? input.created_at ?? now),
    lastUpdated: normalizeDate(input.lastUpdated ?? input.last_updated ?? now),
    preview: input.preview || getPreview(messages),
  });
}

function normalizeConversation(input: StoredConversation): StoredConversation {
  const messages = Array.isArray(input.messages) ? input.messages.map(normalizeMessage) : [];
  return {
    id: String(input.id),
    title: input.title || makeTitle(messages),
    messages,
    createdAt: normalizeDate(input.createdAt),
    lastUpdated: normalizeDate(input.lastUpdated),
    preview: input.preview || getPreview(messages),
  };
}

function normalizeMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    id: message.id || crypto.randomUUID(),
    timestamp: normalizeDate(message.timestamp),
  };
}

function normalizeDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function getPreview(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((message) => message.content.trim());
  return last ? last.content.slice(0, 140) : "";
}

function makeTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((message) => message.isUser && message.content.trim());
  return firstUser ? firstUser.content.slice(0, 48) : "New conversation";
}

function sortByLastUpdated(a: StoredConversation, b: StoredConversation): number {
  return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
}

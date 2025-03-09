import { v4 as uuidv4 } from 'uuid';

/**
 * Message object structure
 */
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Conversation class to store messages and metadata
 */
export class Conversation {
  id: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;

  constructor(id: string | null = null) {
    this.id = id || uuidv4();
    this.messages = [];
    this.createdAt = new Date();
    this.lastUpdated = this.createdAt;
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: Message): void {
    this.messages.push(message);
    this.lastUpdated = new Date();
  }

  /**
   * Reset all messages in the conversation
   */
  reset(): void {
    this.messages = [];
    this.lastUpdated = new Date();
  }

  /**
   * Convert conversation to info object
   */
  toInfo(): any {
    // Get a preview from the last user or assistant message
    let preview = '';
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant' || this.messages[i].role === 'user') {
        preview = this.messages[i].content.substring(0, 100) + (this.messages[i].content.length > 100 ? '...' : '');
        break;
      }
    }

    return {
      id: this.id,
      title: `Conversation ${this.id.substring(0, 8)}`,
      created_at: this.createdAt.toISOString(),
      last_updated: this.lastUpdated.toISOString(),
      message_count: this.messages.length,
      preview: preview
    };
  }
}

/**
 * Manages multiple conversations
 */
export class ConversationManager {
  private conversations: Map<string, Conversation>;
  private storageKey: string = 'conversations';

  constructor() {
    this.conversations = new Map();
    this.loadFromStorage();
  }

  /**
   * Load conversations from browser storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const data = await chrome.storage.local.get(this.storageKey);
      const savedConversations = data[this.storageKey] || [];
      
      savedConversations.forEach((convData: any) => {
        const conversation = new Conversation(convData.id);
        conversation.messages = convData.messages;
        conversation.createdAt = new Date(convData.createdAt);
        conversation.lastUpdated = new Date(convData.lastUpdated);
        
        this.conversations.set(conversation.id, conversation);
      });
    } catch (error) {
      console.error('Error loading conversations from storage:', error);
    }
  }

  /**
   * Save conversations to browser storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const conversationsArray = Array.from(this.conversations.values()).map(conv => ({
        id: conv.id,
        messages: conv.messages,
        createdAt: conv.createdAt.toISOString(),
        lastUpdated: conv.lastUpdated.toISOString()
      }));
      
      await chrome.storage.local.set({ [this.storageKey]: conversationsArray });
    } catch (error) {
      console.error('Error saving conversations to storage:', error);
    }
  }

  /**
   * Get a conversation by ID or create a new one
   */
  getConversation(conversationId: string | null = null): Conversation {
    if (conversationId && this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }
    
    // Create a new conversation
    const newConversation = new Conversation(conversationId);
    this.conversations.set(newConversation.id, newConversation);
    this.saveToStorage();
    
    return newConversation;
  }

  /**
   * Reset a conversation by ID
   */
  resetConversation(conversationId: string): boolean {
    if (this.conversations.has(conversationId)) {
      this.conversations.get(conversationId)!.reset();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Delete a conversation by ID
   */
  deleteConversation(conversationId: string): boolean {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Get info for all conversations
   */
  getAllConversations(): any[] {
    return Array.from(this.conversations.values())
      .map(conv => conv.toInfo())
      .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
  }
} 
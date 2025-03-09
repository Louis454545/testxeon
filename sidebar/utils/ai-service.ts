import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse, Tab } from '../types/api';

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
class Conversation {
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

  addMessage(message: Message): void {
    this.messages.push(message);
    this.lastUpdated = new Date();
  }

  reset(): void {
    this.messages = [];
    this.lastUpdated = new Date();
  }

  toInfo(): any {
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
class ConversationManager {
  private conversations: Map<string, Conversation>;
  private storageKey: string = 'conversations';

  constructor() {
    this.conversations = new Map();
    this.loadFromStorage();
  }

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

  getConversation(conversationId: string | null = null): Conversation {
    if (conversationId && this.conversations.has(conversationId)) {
      return this.conversations.get(conversationId)!;
    }
    
    const newConversation = new Conversation(conversationId);
    this.conversations.set(newConversation.id, newConversation);
    this.saveToStorage();
    
    return newConversation;
  }

  resetConversation(conversationId: string): boolean {
    if (this.conversations.has(conversationId)) {
      this.conversations.get(conversationId)!.reset();
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteConversation(conversationId: string): boolean {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getAllConversations(): any[] {
    return Array.from(this.conversations.values())
      .map(conv => conv.toInfo())
      .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
  }
}

/**
 * Configuration for AI providers
 */
interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  provider: 'google' | 'openai';
}

/**
 * Class that handles all AI operations directly from the extension
 */
export class AIService {
  private config: AIConfig;
  private conversationManager: ConversationManager;
  private systemPrompt: string;

  constructor() {
    this.conversationManager = new ConversationManager();
    this.systemPrompt = '';
    
    // Default configuration - will be loaded from storage
    this.config = {
      apiKey: '',
      model: 'gemini-2.0-flash',
      temperature: 1.0,
      provider: 'google'
    };
    
    // Load configuration and prompt from storage
    this.initialize();
  }

  /**
   * Initialize the AI service by loading config and prompt
   */
  private async initialize() {
    try {
      // Load config from storage
      const { aiConfig, systemPrompt } = await chrome.storage.local.get(['aiConfig', 'systemPrompt']);
      
      if (aiConfig) {
        this.config = aiConfig;
      }
      
      if (systemPrompt) {
        this.systemPrompt = systemPrompt;
      } else {
        // Load default prompt from extension assets
        const response = await fetch(chrome.runtime.getURL('assets/default-prompt.md'));
        this.systemPrompt = await response.text();
        await chrome.storage.local.set({ systemPrompt: this.systemPrompt });
      }
    } catch (error) {
      console.error('Error initializing AI service:', error);
    }
  }

  /**
   * Save the current configuration to storage
   */
  async saveConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
    await chrome.storage.local.set({ aiConfig: this.config });
  }

  /**
   * Save the system prompt to storage
   */
  async saveSystemPrompt(prompt: string) {
    this.systemPrompt = prompt;
    await chrome.storage.local.set({ systemPrompt: prompt });
  }

  /**
   * Process a message with the AI
   */
  async processMessage(
    interactiveElements: string,
    tabs: Tab[],
    conversationId: string | null = null,
    userMessage: string | null = null,
    image: string | null = null
  ): Promise<ApiResponse> {
    // Get or create conversation
    const conversation = this.conversationManager.getConversation(conversationId);
    const isNew = conversation.messages.length === 0;

    // Add system message if conversation is new
    if (isNew) {
      conversation.addMessage({ role: 'system', content: this.systemPrompt });
    }

    // Add user message if it exists
    if (userMessage) {
      conversation.addMessage({ role: 'user', content: userMessage });
    }

    // Create context message
    const contextMessage = this.createContextMessage(interactiveElements, tabs, image);
    
    // Add context message
    conversation.addMessage({ role: 'user', content: contextMessage });

    // Make API call
    try {
      const aiResponse = await this.callAI(conversation.messages);
      
      // Remove context message (temporary)
      conversation.messages.pop();
      
      // Add AI response
      conversation.addMessage({ role: 'assistant', content: aiResponse });

      // Parse the response
      try {
        let content = aiResponse.trim();
        if (content.startsWith('```json')) {
          const start = content.indexOf('{');
          const end = content.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            content = content.substring(start, end + 1);
          }
        }
        
        const responseData = JSON.parse(content);
        return {
          conversation_id: conversation.id,
          message: responseData.current_state?.message || '',
          content: aiResponse,
          action: responseData.action || []
        };
      } catch (error) {
        console.error('Error parsing AI response:', error);
        return {
          conversation_id: conversation.id,
          message: 'Error parsing AI response. Please try again.',
          content: aiResponse,
          action: []
        };
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error;
    }
  }

  /**
   * Call the AI API with the given messages
   */
  private async callAI(messages: any[]): Promise<string> {
    if (this.config.provider === 'google') {
      return this.callGeminiAPI(messages);
    } else {
      return this.callOpenAIAPI(messages);
    }
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(messages: any[]): Promise<string> {
    // Séparation des messages système et utilisateur
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');

    // Construction de la requête avec l'instruction système
    const requestBody: any = {
      contents: [],
      generationConfig: {
        temperature: this.config.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain"
      }
    };

    // Ajouter l'instruction système si elle existe
    if (systemMessages.length > 0) {
      requestBody.systemInstruction = {
        role: "user",
        parts: [{ text: systemMessages[0].content }]
      };
    }

    // Formater les messages pour l'API
    for (const msg of nonSystemMessages) {
      const messageParts: any[] = [];

      // Vérifier si le message contient une image (screenshot)
      if (msg.content && typeof msg.content === 'string') {
        // Vérifier si le contenu contient des métadonnées d'image
        const hasImage = msg.content.includes('data:image/jpeg;base64,') || 
                          msg.content.includes('data:image/png;base64,');

        if (hasImage) {
          // Extraire le texte et l'image
          const imageMatch = msg.content.match(/data:image\/(?:jpeg|png);base64,[^)]+/);
          let textContent = msg.content;
          
          if (imageMatch) {
            // Retirer la partie image du texte
            textContent = textContent.replace(imageMatch[0], '[Image attached]');
            // Ajouter l'image comme partie séparée
            messageParts.push({ text: textContent });
            messageParts.push({ 
              inlineData: { 
                mimeType: imageMatch[0].includes('jpeg') ? 'image/jpeg' : 'image/png',
                data: imageMatch[0].split('base64,')[1] 
              }
            });
          } else {
            messageParts.push({ text: textContent });
          }
        } else {
          messageParts.push({ text: msg.content });
        }
      } else {
        messageParts.push({ text: msg.content || '' });
      }

      requestBody.contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: messageParts
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // S'assurer que la réponse contient les données attendues
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error('Unexpected API response structure');
    }
    
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAIAPI(messages: any[]): Promise<string> {
    const requestBody = {
      model: this.config.model,
      messages: messages,
      temperature: this.config.temperature
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Create a context message with the current page data
   */
  private createContextMessage(
    interactiveElements: string,
    tabs: Tab[],
    image: string | null = null
  ): string {
    // Utiliser directement l'arbre d'accessibilité sans conversion XML
    let accessibilityData = interactiveElements;
    try {
      // Si c'est une chaîne de caractères au format JSON, vérifier qu'elle est valide
      if (typeof accessibilityData === 'string') {
        JSON.parse(accessibilityData); // Simplement pour valider que c'est du JSON valide
      }
    } catch (error) {
      accessibilityData = "Error parsing accessibility data";
      console.error('Error parsing accessibility data:', error);
    }
    
    const activeTab = tabs.find(tab => tab.active);
    const currentUrl = activeTab?.url || "Unknown URL";
    
    const tabsInfo = "\nAvailable tabs:\n" + tabs.map(tab => 
      `- ID: ${tab.id}, Title: ${tab.title}, URL: ${tab.url}, Active: ${tab.active}`
    ).join("\n");
    
    let contextInfo = 
      `Current URL: ${currentUrl}\n` +
      `Interactive Elements (JSON format):\n${accessibilityData}\n${tabsInfo}`;
    
    // Ajouter l'image si présente
    if (image) {
      contextInfo += `\n\nScreenshot: data:image/jpeg;base64,${image}`;
    }
    
    return contextInfo;
  }

  /**
   * Reset a conversation
   */
  resetConversation(conversationId: string): boolean {
    return this.conversationManager.resetConversation(conversationId);
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): boolean {
    return this.conversationManager.deleteConversation(conversationId);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): any[] {
    return this.conversationManager.getAllConversations();
  }
} 
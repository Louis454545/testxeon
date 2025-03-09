import type { ApiPayload, ApiResponse, Tab } from '../types/api';
import { AIService } from './ai-service';

// Create a global instance of the AI service
const aiService = new AIService();

/**
 * Default API endpoints
 */
const API_BASE = 'http://localhost:5000/api';
const API_ENDPOINTS = {
  message: `${API_BASE}/message`,
  resetConversation: (id: string) => `${API_BASE}/conversations/${id}/reset`,
  deleteConversation: (id: string) => `${API_BASE}/conversations/${id}`,
  getConversations: `${API_BASE}/conversations`
};

/**
 * Gets a list of all tabs in the current window
 */
async function getAllTabs(): Promise<Tab[]> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs.map(tab => ({
    id: String(tab.id || ''),
    url: tab.url || '',
    title: tab.title || '',
    active: tab.active,
  }));
}

/**
 * Sends data to the AI service and returns the response
 */
export async function sendToApi(
  snapshot: any,
  screenshot: string,
  userMessage?: string,
  conversationId: string | null = null,
  abortController?: AbortController
): Promise<ApiResponse> {
  const allTabs = await getAllTabs();

  try {
    // Use our local AI service instead of making a network request
    const response = await aiService.processMessage(
      JSON.stringify(snapshot),
      allTabs,
      conversationId,
      userMessage || undefined,
      screenshot
    );
    
    return response;
  } catch (error) {
    console.error('Error processing message with AI service:', error);
    throw error;
  }
}

/**
 * Reset a conversation
 */
export async function resetConversation(conversationId: string): Promise<void> {
  if (!aiService.resetConversation(conversationId)) {
    throw new Error(`Failed to reset conversation: ${conversationId}`);
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (!aiService.deleteConversation(conversationId)) {
    throw new Error(`Failed to delete conversation: ${conversationId}`);
  }
}

/**
 * Get all conversations
 */
export async function getConversations(): Promise<any[]> {
  return aiService.getAllConversations();
}

/**
 * Save AI configuration
 */
export async function saveAIConfig(config: any): Promise<void> {
  await aiService.saveConfig(config);
}

/**
 * Save system prompt
 */
export async function saveSystemPrompt(prompt: string): Promise<void> {
  await aiService.saveSystemPrompt(prompt);
}
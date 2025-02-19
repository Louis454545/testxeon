import type { ApiPayload, ApiResponse, Tab } from '../types/api';

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
 * Sends data to the API and returns the response
 */
export async function sendToApi(
  snapshot: any,
  screenshot: string,
  userMessage?: string,
  conversationId: string | null = null
): Promise<ApiResponse> {
  const allTabs = await getAllTabs();

  const payload: ApiPayload = {
    context: JSON.stringify(snapshot),
    image: screenshot,
    tabs: allTabs,
    conversation_id: conversationId
  };

  if (userMessage) {
    payload.message = userMessage;
  }

  const response = await fetch(API_ENDPOINTS.message, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Reset a conversation
 */
export async function resetConversation(conversationId: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.resetConversation(conversationId), {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to reset conversation: ${response.statusText}`);
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.deleteConversation(conversationId), {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }
}

/**
 * Get all conversations
 */
export async function getConversations(): Promise<any[]> {
  const response = await fetch(API_ENDPOINTS.getConversations);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
  }
  
  return response.json();
}
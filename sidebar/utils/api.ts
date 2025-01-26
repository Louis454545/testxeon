import { Message, getMessageRole } from '../types';
import type { ApiPayload, ApiResponse, Role, Tab } from '../types/api';

/**
 * Default API endpoint
 */
const API_ENDPOINT = 'http://localhost:5000/api/data';

/**
 * Converts app messages to API conversation format
 */
function convertToApiMessages(messages: Message[]): { role: Role; content: string }[] {
  return messages.map(msg => ({
    role: getMessageRole(msg),
    content: msg.content
  }));
}

/**
 * Gets a list of all tabs in the current window
 */
async function getAllTabs(): Promise<Tab[]> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs.map(tab => ({
    id: tab.id || 0,
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
  messages: Message[] = [],
  task?: string
): Promise<ApiResponse> {
  try {
    // Get current tab for URL
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.url) {
      throw new Error('No active tab found');
    }

    const allTabs = await getAllTabs();
    const conversationHistory = convertToApiMessages(messages);

    const payload: ApiPayload = {
      html_code: JSON.stringify(snapshot),
      current_url: activeTab.url,
      task: messages.length === 0 ? task : undefined,
      image: screenshot,
      last_action_success: (window as any).lastActionSuccess || false,
      conversation_history: conversationHistory,
      tabs: allTabs,
    };

    const response = await fetch(API_ENDPOINT, {
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
  } catch (error) {
    console.error('Error sending data to API:', error);
    return {
      message: 'Failed to process request',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
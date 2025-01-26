interface Tab {
  id: number;
  url: string;
  title: string;
  active: boolean;
}

import { Role } from '../types';

interface ConversationMessage {
  role: Role;
  content: string;
}

interface ApiPayload {
  html_code: string;
  current_url: string;
  task?: string;
  image: string;
  last_action_success: boolean;
  conversation_history: ConversationMessage[];
  tabs: Tab[];
}

async function getAllTabs(): Promise<Tab[]> {
  const allTabs = await chrome.tabs.query({ currentWindow: true });
  return allTabs.map((tab) => ({
    id: tab.id || 0,
    url: tab.url || '',
    title: tab.title || '',
    active: tab.active,
  }));
}

export async function sendToApi(
  snapshot: any,
  screenshot: string,
  task?: string,
  conversationHistory: any[] = []
): Promise<any> {
  try {
    // Get current tab for URL
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.url) {
      throw new Error('No active tab found');
    }

    // Get all tabs
    const allTabs = await getAllTabs();

    // Prepare payload
    const data: ApiPayload = {
      html_code: JSON.stringify(snapshot),
      current_url: activeTab.url,
      task: conversationHistory.length === 0 ? task : undefined,
      image: screenshot,
      last_action_success: (window as any).lastActionSuccess || false,
      conversation_history: conversationHistory,
      tabs: allTabs,
    };

    // Send to API
    const response = await fetch("http://localhost:5000/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error sending data to API:', error);
    throw error;
  }
}
import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

import { Message as AppMessage } from '../types';

export async function sendMessage(content: string): Promise<AppMessage> {
  // Create a new message object
  const newMessage: AppMessage = {
    content,
    isUser: true,
    timestamp: new Date(),
  };

  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id || !activeTab.url) {
      throw new Error('No active tab found');
    }

    // Get accessibility snapshot
    const browser = await connect({
      transport: await ExtensionTransport.connectTab(activeTab.id),
    });
    
    const [page] = await browser.pages();
    const snapshot = await page.accessibility.snapshot();
    
    // Add snapshot to message
    newMessage.snapshot = snapshot;

    // Clean up browser connection
    await browser.disconnect();
    
    return newMessage;
  } catch (error) {
    console.error('Error getting accessibility snapshot:', error);
    return newMessage; // Return message even if snapshot fails
  }
}
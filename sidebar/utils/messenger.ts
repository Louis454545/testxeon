import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import { Message as AppMessage } from '../types';
import { sendToApi } from './api';

export async function sendMessage(content: string, task?: string, conversationHistory: any[] = []): Promise<AppMessage> {
  // Create a new message object
  const newMessage: AppMessage = {
    content,
    isUser: true,
    timestamp: new Date(),
  };

  try {
    // Get current active tab and connect to it
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id || !activeTab.url) {
      throw new Error('No active tab found');
    }

    const browser = await connect({
      transport: await ExtensionTransport.connectTab(activeTab.id),
      defaultViewport: null,
    });
    
    const [page] = await browser.pages();
    
    // Get accessibility snapshot and screenshot in parallel
    const [snapshot, screenshot] = await Promise.all([
      page.accessibility.snapshot(),
      page.screenshot({ encoding: 'base64', fullPage: true, type: 'png' })
    ]);

    // Clean up browser connection
    await browser.disconnect();
    
    // Send to API and get response
    const apiResponse = await sendToApi(
      snapshot,
      screenshot,
      task,
      conversationHistory
    );
    
    // Add API response to message
    newMessage.snapshot = apiResponse;
    
    return newMessage;
  } catch (error) {
    console.error('Error processing message:', error);
    newMessage.snapshot = { error: 'Failed to process message' };
    return newMessage;
  }
}
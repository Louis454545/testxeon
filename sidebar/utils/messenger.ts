import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import { Message, createMessage } from '../types';
import { sendToApi } from './api';
import type { ApiResponse } from '../types/api';

/**
 * Sends a message and captures page data
 */
export async function sendMessage(
  content: string,
  task?: string,
  previousMessages: Message[] = []
): Promise<Message> {
  try {
    // Get current active tab and connect to it
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) {
      throw new Error('No active tab found');
    }

    const browser = await connect({
      transport: await ExtensionTransport.connectTab(activeTab.id),
      defaultViewport: null,
    });
    
    const [page] = await browser.pages();
    
    // Get page data in parallel
    const [snapshot, screenshot] = await Promise.all([
      page.accessibility.snapshot(),
      page.screenshot({ encoding: 'base64', fullPage: true, type: 'png' })
    ]);

    // Clean up browser connection
    await browser.disconnect();
    
    // Send to API and get response
    const apiResponse = await sendToApi(
      snapshot,
      `${screenshot}`,
      previousMessages,
      task
    );
    
    // Create and return message with API response
    return createMessage(content, true, apiResponse);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    // Return message even if process fails
    const errorResponse: ApiResponse = {
      message: 'Failed to process message',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    return createMessage(content, true, errorResponse);
  }
}
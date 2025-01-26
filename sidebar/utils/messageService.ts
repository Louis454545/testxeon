import { Message, createMessage } from '../types';
import { ApiResponse } from '../types/api';
import { sendToApi } from './api';
import { BrowserService } from './browserService';
import { PageCaptureService } from './pageCapture';

/**
 * Service for handling message processing and communication
 */
export class MessageService {
  /**
   * Process and send a message, capturing current page data
   */
  static async sendMessage(
    content: string,
    task?: string,
    previousMessages: Message[] = []
  ): Promise<Message> {
    try {
      // Connect to browser and capture page data
      const { browser, page } = await BrowserService.connectToActiveTab();
      const pageData = await PageCaptureService.capturePageData(page);
      
      // Clean up browser connection
      await BrowserService.disconnect(browser);
      
      // Send to API and get response
      const apiResponse = await sendToApi(
        pageData.accessibility,
        pageData.screenshot,
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
}
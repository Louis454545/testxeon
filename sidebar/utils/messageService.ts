import { Message, createMessage } from '../types';
import { ApiResponse } from '../types/api';
import { sendToApi } from './api';
import { DebuggerConnectionService } from './debuggerConnection';
import { PageCaptureService } from './pageCapture';
import { ActionOperator } from './ActionOperator';

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
    let connection;
    try {
      // Connect to browser and capture page data
      connection = await DebuggerConnectionService.connect();
      const pageData = await PageCaptureService.capturePageData(connection.page);
      
      // Send to API and get response
      const apiResponse = await sendToApi(
        pageData.accessibility,
        pageData.screenshot,
        previousMessages,
        task
      );

      // Handle action if present in response
      if (apiResponse.action) {
        const actionOperator = new ActionOperator(connection.page);
        try {
          const actionSuccess = await actionOperator.executeAction(apiResponse.action);
          (window as any).lastActionSuccess = actionSuccess;
        } catch (error) {
          console.error('Error executing action:', error);
          (window as any).lastActionSuccess = false;
        }
      }
      
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
    } finally {
      // Clean up browser connection
      if (connection) {
        await DebuggerConnectionService.disconnect(connection.browser);
      }
    }
  }
}
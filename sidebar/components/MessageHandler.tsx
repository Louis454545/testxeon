import { Message, createMessage } from '../types';
import { ApiResponse } from '../types/api';
import { DebuggerConnectionService } from '../utils/debuggerConnection';
import { PageCaptureService } from '../utils/pageCapture';
import { ActionOperator } from '../utils/ActionOperator';
import { sendToApi } from '../utils/api';

export class MessageHandler {
  private static currentConversationId: string | null = null;

  static async getApiResponse(
    content: string | undefined = undefined,
    existingPage: any = null,
    lastActionResults: boolean[] = []
  ): Promise<[ApiResponse, any, any]> {
    let page;
    let browser;
    let shouldDisconnect = false;
    
    try {
      if (existingPage) {
        page = existingPage;
        browser = null;
      } else {
        const connection = await DebuggerConnectionService.connect();
        page = connection.page;
        browser = connection.browser;
        shouldDisconnect = true;
      }

      const pageData = await PageCaptureService.capturePageData(page);
      const apiResponse = await sendToApi(
        pageData.accessibility,
        pageData.screenshot,
        content,
        this.currentConversationId,
        lastActionResults
      );

      // Store the conversation ID for future requests
      this.currentConversationId = apiResponse.conversation_id;
      
      return [apiResponse, page, browser];
    } catch (error) {
      if (shouldDisconnect && browser) {
        await DebuggerConnectionService.disconnect(browser);
      }
      throw error;
    }
  }

  static async executeAction(page: any, apiResponse: ApiResponse): Promise<boolean[]> {
    if (apiResponse.action) {
      const actionOperator = new ActionOperator(page);
      try {
        const results: boolean[] = [];
        for (const action of apiResponse.action) {
          const success = await actionOperator.executeAction(action);
          results.push(success);
        }
        return results;
      } catch (error) {
        console.error('Error executing action:', error);
        return apiResponse.action.map(() => false);
      }
    }
    return [];
  }

  static async processMessage(content: string): Promise<Message> {
    try {
      const [apiResponse, page, browser] = await this.getApiResponse(content);
      const message = createMessage(apiResponse.content, false, apiResponse);
      
      try {
        await this.executeAction(page, apiResponse);
      } finally {
        await DebuggerConnectionService.disconnect(browser);
      }
      
      return message;
    } catch (error) {
      console.error('Error in processMessage:', error);
      throw error;
    }
  }
}
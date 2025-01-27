import { Message, createMessage, getMessageRole } from '../types';
import { ApiPayload, ApiResponse, Role, Tab, ConversationMessage } from '../types/api';
import { DebuggerConnectionService } from '../utils/debuggerConnection';
import { PageCaptureService } from '../utils/pageCapture';
import { ActionOperator } from '../utils/ActionOperator';

export class MessageHandler {
  private static readonly API_ENDPOINT = 'http://localhost:5000/api/data';

  private static async getAllTabs(): Promise<Tab[]> {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return tabs.map(tab => ({
      id: tab.id || 0,
      url: tab.url || '',
      title: tab.title || '',
      active: tab.active,
    }));
  }

  private static convertToApiMessages(messages: Message[]): ConversationMessage[] {
    const apiMessages = messages.map(msg => {
      // Convert to literal strings that Python expects
      const message = {
        role: msg.isUser ? 'human' : 'assistant',
        content: msg.content
      } as ConversationMessage;
      console.log('Converting message:', message);
      return message;
    });
    console.log('Final conversation history:', apiMessages);
    return apiMessages;
  }

  public static async sendApiRequest(
    snapshot: any,
    screenshot: string,
    messages: Message[] = []
  ): Promise<ApiResponse> {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.url) {
        throw new Error('No active tab found');
      }

      const allTabs = await this.getAllTabs();
      const conversationHistory = this.convertToApiMessages(messages);

      const formattedHistory = this.convertToApiMessages(messages);
      console.log('Conversation history:', JSON.stringify(formattedHistory, null, 2));
      
      const payload: ApiPayload = {
        context: JSON.stringify(snapshot),
        current_url: activeTab.url,
        image: screenshot,
        last_action_success: (window as any).lastActionSuccess || false,
        conversation_history: formattedHistory,
        tabs: allTabs,
      };
      
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const payloadString = JSON.stringify(payload, null, 2);
      console.log('Sending payload to API:', payloadString);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadString,
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

  static async getApiResponse(
    content: string,
    previousMessages: Message[] = []
  ): Promise<[ApiResponse, any, any]> {
    const connection = await DebuggerConnectionService.connect();
    try {
      const pageData = await PageCaptureService.capturePageData(connection.page);
      const apiResponse = await this.sendApiRequest(
        pageData.accessibility,
        pageData.screenshot,
        previousMessages
      );
      return [apiResponse, connection.page, connection.browser];
    } catch (error) {
      await DebuggerConnectionService.disconnect(connection.browser);
      throw error;
    }
  }

  static async executeAction(page: any, apiResponse: ApiResponse): Promise<boolean> {
    if (apiResponse.action) {
      const actionOperator = new ActionOperator(page);
      try {
        const actionSuccess = await actionOperator.executeAction(apiResponse.action);
        (window as any).lastActionSuccess = actionSuccess;
        return actionSuccess;
      } catch (error) {
        console.error('Error executing action:', error);
        (window as any).lastActionSuccess = false;
        return false;
      }
    }
    return true;
  }

  static async processMessage(
    content: string,
    previousMessages: Message[] = []
  ): Promise<Message> {
    try {
      const [apiResponse, page, browser] = await this.getApiResponse(content, previousMessages);
      const message = createMessage(apiResponse.message, false, apiResponse);
      
      try {
        await this.executeAction(page, apiResponse);
      } finally {
        await DebuggerConnectionService.disconnect(browser);
      }
      
      return message;
    } catch (error) {
      console.error('Error in processMessage:', error);
      const errorResponse: ApiResponse = {
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return createMessage(content, false, errorResponse);
    }
  }
}
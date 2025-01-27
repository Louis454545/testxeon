import { Message, createMessage } from '../types';
import { ApiPayload, ApiResponse, Role, Tab } from '../types/api';
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

  private static convertToApiMessages(messages: Message[]): { role: Role; content: string }[] {
    return messages.map(msg => ({
      role: msg.isUser ? 'user' as Role : 'assistant' as Role,
      content: msg.content
    }));
  }

  private static async sendToApi(
    snapshot: any,
    screenshot: string,
    messages: Message[] = [],
    task?: string
  ): Promise<ApiResponse> {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.url) {
        throw new Error('No active tab found');
      }

      const allTabs = await this.getAllTabs();
      const conversationHistory = this.convertToApiMessages(messages);

      const payload: ApiPayload = {
        html_code: JSON.stringify(snapshot),
        current_url: activeTab.url,
        task: messages.length === 0 ? task : undefined,
        image: screenshot,
        last_action_success: (window as any).lastActionSuccess || false,
        conversation_history: conversationHistory,
        tabs: allTabs,
      };

      const response = await fetch(this.API_ENDPOINT, {
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

  static async processMessage(
    content: string,
    task?: string,
    previousMessages: Message[] = []
  ): Promise<Message> {
    let connection;
    try {
      connection = await DebuggerConnectionService.connect();
      const pageData = await PageCaptureService.capturePageData(connection.page);
      
      const apiResponse = await this.sendToApi(
        pageData.accessibility,
        pageData.screenshot,
        previousMessages,
        task
      );

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
      
      return createMessage(apiResponse.message, false, apiResponse);
    } catch (error) {
      console.error('Error in processMessage:', error);
      
      const errorResponse: ApiResponse = {
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      return createMessage(content, false, errorResponse);
    } finally {
      if (connection) {
        await DebuggerConnectionService.disconnect(connection.browser);
      }
    }
  }
}
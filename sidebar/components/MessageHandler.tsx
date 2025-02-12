import { Message, createMessage } from '../types';
import { ApiResponse } from '../types/api';
import { DebuggerConnectionService } from '../utils/debuggerConnection';
import { PageCaptureService } from '../utils/pageCapture';
import { ActionOperator } from '../utils/ActionOperator';
import { sendToApi } from '../utils/api';
import { Browser, Page } from 'puppeteer';

export class MessageHandler {
  private static currentConversationId: string | null = null;
  private static currentBrowser: Browser | null = null;
  private static currentPage: Page | null = null;

  static async getApiResponse(
    content: string | undefined = undefined,
    existingPage: any = null,
    toolsResults: Array<{ tool_call_id: string; content: string }> = []
  ): Promise<[ApiResponse, any, any]> {
    let page;
    let browser;
    let shouldDisconnect = false;
    
    try {
      if (existingPage) {
        page = existingPage;
        browser = null;
      } else if (this.currentPage) {
        page = this.currentPage;
        browser = this.currentBrowser;
      } else {
        const connection = await DebuggerConnectionService.connect();
        page = connection.page;
        browser = connection.browser;
        this.currentPage = page;
        this.currentBrowser = browser;
      }

      const pageData = await PageCaptureService.capturePageData(page);
      const apiResponse = await sendToApi(
        pageData.accessibility,
        pageData.screenshot,
        content,
        this.currentConversationId,
        toolsResults
      );

      this.currentConversationId = apiResponse.conversation_id;
      
      return [apiResponse, page, browser];
    } catch (error) {
      if (shouldDisconnect && browser) {
        await DebuggerConnectionService.disconnect(browser);
        this.currentPage = null;
        this.currentBrowser = null;
      }
      throw error;
    }
  }

  static async executeAction(page: any, apiResponse: ApiResponse) {
    if (apiResponse.action) {
      const actionOperator = new ActionOperator(page);
      const results = [];
      
      for (const action of apiResponse.action) {
        try {
          // Ajouter l'exécution de l'action et récupérer le résultat
          const success = await actionOperator.executeAction(action);
          results.push({
            tool_call_id: action.tool_call_id,
            content: success ? "Action exécutée avec succès" : "Échec de l'action"
          });
        } catch (error) {
          results.push({
            tool_call_id: action.tool_call_id,
            content: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
          });
        }
      }
      
      return results;
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
        // Ne pas déconnecter ici pour garder la session ouverte
        // await DebuggerConnectionService.disconnect(browser); ← À SUPPRIMER
      }
      
      return message;
    } catch (error) {
      console.error('Error in processMessage:', error);
      throw error;
    }
  }

  static async closeConnection() {
    if (this.currentBrowser) {
      await DebuggerConnectionService.disconnect(this.currentBrowser);
      this.currentPage = null;
      this.currentBrowser = null;
    }
  }

  static async executeSingleAction(page: any, action: any) {
    const actionOperator = new ActionOperator(page);
    try {
      const success = await actionOperator.executeAction(action);
      return {
        tool_call_id: action.tool_call_id,
        content: success ? "Action exécutée avec succès" : "Échec de l'action"
      };
    } catch (error) {
      return {
        tool_call_id: action.tool_call_id,
        content: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
      };
    }
  }
}
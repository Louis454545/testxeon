import { Message, createMessage } from '../types';
import { ApiResponse } from '../types/api';
import { DebuggerConnectionService } from '../utils/debuggerConnection';
import { PageCaptureService } from '../utils/pageCapture';
import { ActionOperator } from '../utils/ActionOperator';
import { sendToApi } from '../utils/api';
import type { Browser as CoreBrowser, Page as CorePage } from 'puppeteer-core';

export class MessageHandler {
  private static currentConversationId: string | null = null;
  private static currentBrowser: CoreBrowser | null = null;
  private static currentPage: CorePage | null = null;

  static async getApiResponse(
    content: string | undefined = undefined,
    existingPage: CorePage | null = null,
    actionResults: Array<{ success: boolean; description: string }> = [],
    abortController?: AbortController
  ): Promise<[ApiResponse, CorePage, CoreBrowser | null]> {
    let page: CorePage;
    let browser: CoreBrowser | null = null;
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
        page = connection.page as CorePage;
        browser = connection.browser as CoreBrowser;
        this.currentPage = page;
        this.currentBrowser = browser;
        shouldDisconnect = true;
      }

      const pageData = await PageCaptureService.capturePageData(page);
      const apiResponse = await sendToApi(
        pageData.accessibility,
        pageData.screenshot,
        content,
        this.currentConversationId,
        abortController
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

  static async executeAction(page: CorePage, apiResponse: ApiResponse) {
    if (apiResponse.action && apiResponse.action.length > 0) {
      const actionOperator = new ActionOperator(page);
      const results = [];
      
      for (const action of apiResponse.action) {
        try {
          const success = await actionOperator.executeAction(action);
          results.push({
            success,
            description: success ? "Action exécutée avec succès" : "Échec de l'action"
          });
        } catch (error) {
          results.push({
            success: false,
            description: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
          });
        }
      }
      
      return results;
    }
    return [];
  }

  static async processMessage(content: string): Promise<Message> {
    try {
      let shouldContinue = true;
      let finalMessage = '';
      
      do {
        const [apiResponse, page, browser] = await this.getApiResponse(content);
        const messageContent = apiResponse.message || apiResponse.content;
        const message = createMessage(messageContent, false, apiResponse);

        if (apiResponse.action) {
          const actionResults = await this.executeAction(page, apiResponse);
          
          // Vérifier les actions de fin
          const hasCompletionAction = apiResponse.action.some(a => 
            'done' in a || 'ask' in a
          );
          
          shouldContinue = !hasCompletionAction;
          finalMessage = messageContent;

          // Si c'est une question ou une complétion, arrêter immédiatement
          if (hasCompletionAction) {
            await this.closeConnection();
            return createMessage(finalMessage, false, apiResponse);
          }
        }

        if (!shouldContinue) {
          await this.closeConnection();
          return createMessage(finalMessage, false, apiResponse);
        }

      } while (shouldContinue);

      return createMessage(finalMessage, false);
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

  static async executeSingleAction(page: CorePage, action: any) {
    const actionOperator = new ActionOperator(page);
    try {
      const success = await actionOperator.executeAction(action);
      return {
        success,
        description: success ? "Action exécutée avec succès" : "Échec de l'action"
      };
    } catch (error) {
      return {
        success: false,
        description: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`
      };
    }
  }
}
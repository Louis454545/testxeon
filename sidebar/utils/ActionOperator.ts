import type { Page } from 'puppeteer-core/lib/types';
import { nodeMap } from './pageCapture';

export enum ActionType {
  CLICK = 'click',
  INPUT = 'input',
  ASK = 'ask',
}

interface ActionBase {
  type: ActionType;
  target: string;
  description?: string;
}

interface ClickAction extends ActionBase {
  type: ActionType.CLICK;
}

interface InputAction extends ActionBase {
  type: ActionType.INPUT;
  text: string;
}

interface AskAction extends ActionBase {
  type: ActionType.ASK;
  text: string; // The question or clarification needed
}

export type Action = ClickAction | InputAction | AskAction;

export class ActionOperator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async executeAction(action: Action): Promise<boolean> {
    try {
      switch (action.type) {
        case ActionType.CLICK: {
          const node = nodeMap.get(String(action.target));
          if (!node) {
            console.error(`Node not found for target: ${action.target}`);
            return false;
          }

          const elementHandle = await node.elementHandle();
          if (!elementHandle) {
            console.error('Failed to get element handle');
            return false;
          }

          await elementHandle.click();
          return true;
        }

        case ActionType.INPUT: {
          const inputnode = nodeMap.get(String(action.target));
          if (!inputnode) {
            console.error(`Node not found for target: ${action.target}`);
            return false;
          }

          const elementHandle = await inputnode.elementHandle();
          if (!elementHandle) {
            console.error('Failed to get element handle');
            return false;
          }

          await elementHandle.type((action as InputAction).text);
          return true;
        }

        case ActionType.ASK:
          // For ASK type, we just return false to indicate processing should stop
          // The content and description will be shown to the user in the UI
          return false;

        default:
          console.error('Unsupported action type');
          return false;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }
  }
}
import type { Page } from 'puppeteer-core/lib/types';
import { nodeMap } from './pageCapture';

export enum ActionType {
  CLICK = 'click',
  INPUT = 'input',
  SCROLL = 'scroll',
  HOVER = 'hover',
}

interface ActionBase {
  type: ActionType;
  target: string;
}

interface ClickAction extends ActionBase {
  type: ActionType.CLICK;
}

interface InputAction extends ActionBase {
  type: ActionType.INPUT;
  value: string;
}

interface ScrollAction extends ActionBase {
  type: ActionType.SCROLL;
  direction: 'up' | 'down';
  amount: number;
}

interface HoverAction extends ActionBase {
  type: ActionType.HOVER;
}

export type Action = ClickAction | InputAction | ScrollAction | HoverAction;

export class ActionOperator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async executeAction(action: Action): Promise<boolean> {
    try {
      switch (action.type) {
        case ActionType.CLICK: {
          // Get the node from nodeMap
          const node = nodeMap.get(String(action.target));
          if (!node) {
            console.error(`Node not found for target: ${action.target}`);
            return false;
          }

          // Get element handle and execute click
          const elementHandle = await node.elementHandle();
          if (!elementHandle) {
            console.error('Failed to get element handle');
            return false;
          }

          // Execute click and clean up
          await elementHandle.click();
          await elementHandle.dispose();
          return true;
        }

        case ActionType.INPUT:
          // TODO: Implement input logic
          return false;

        case ActionType.SCROLL:
          // TODO: Implement scroll logic
          return false;

        case ActionType.HOVER:
          // TODO: Implement hover logic
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
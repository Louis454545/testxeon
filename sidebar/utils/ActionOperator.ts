import type { Page } from 'puppeteer-core/lib/types';
import { 
  Action, 
  ActionName,
  isClickAction,
  isInputAction,
  isGoToUrlAction,
  isSwitchTabAction 
} from '../types/api';
import { nodeMap } from './pageCapture';

export class ActionOperator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async executeAction(action: Action): Promise<boolean> {
    try {
      if (isClickAction(action)) {
        const node = nodeMap.get(String(action.args.target));
        if (!node) {
          console.error(`Node not found for target: ${action.args.target}`);
          return false;
        }

        const elementHandle = await node.elementHandle();
        if (!elementHandle) {
          console.error('Failed to get element handle');
          return false;
        }

        await Promise.all([
          elementHandle.click(),
          this.page.waitForNavigation({ 
            waitUntil: 'networkidle0',
            timeout: 30000 
          }).catch(e => console.log('Navigation normale après clic'))
        ]);
        return true;
      }

      if (isInputAction(action)) {
        const node = nodeMap.get(String(action.args.target));
        if (!node) {
          console.error(`Node not found for target: ${action.args.target}`);
          return false;
        }

        const elementHandle = await node.elementHandle();
        if (!elementHandle) {
          console.error('Failed to get element handle');
          return false;
        }

        await elementHandle.type(action.args.text);
        return true;
      }

      if (isGoToUrlAction(action)) {
        await this.page.goto(action.args.url);
        return true;
      }

      if (isSwitchTabAction(action)) {
        try {
          await chrome.tabs.update(parseInt(action.args.tab_id), { active: true });
          return true;
        } catch (error) {
          console.error('Error switching tab:', error);
          return false;
        }
      }

      console.error(`Unsupported action type: ${action.name}`);
      return false;
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }
  }
}
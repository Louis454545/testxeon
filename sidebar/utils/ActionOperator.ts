import type { Page } from "puppeteer-core/lib/types";
import {
  Action,
  ActionName,
  isClickAction,
  isInputAction,
  isNavigateAction,
  isSwitchTabAction,
  isBackAction,
  isForwardAction,
  isKeyboardAction,
  isWaitAction
} from "../types/api";
import { nodeMap } from "./pageCapture";
import { VisualEffects } from "./visualEffects";

export class ActionOperator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async executeAction(action: Action): Promise<boolean> {
    try {
      // Montrer l'état de chargement avant chaque action
      await VisualEffects.showLoadingState(this.page);

      if (isClickAction(action)) {
        const node = nodeMap.get(String(action.args.id));
        if (!node) {
          console.error(`Node not found for target: ${action.args.id}`);
          return false;
        }

        const elementHandle = await node.elementHandle();
        if (!elementHandle) {
          console.error("Failed to get element handle");
          return false;
        }

        const rect = await elementHandle.evaluate((el: Element) => {
          const { x, y, width, height } = el.getBoundingClientRect();
          return { x, y, width, height };
        });
        // Hover le bouton avant de le clicker
        await elementHandle.hover();
  
        await VisualEffects.showClickEffect(
          this.page,
          rect.x + rect.width / 2,
          rect.y + rect.height / 2
        );

        await elementHandle.click();

        await this.page.waitForFunction(
          () => document.readyState === "complete",
          { timeout: 10000 }
        );
        return true;
      }

      if (isInputAction(action)) {
        const node = nodeMap.get(String(action.args.id));
        if (!node) {
          console.error(`Node not found for target: ${action.args.id}`);
          return false;
        }

        const elementHandle = await node.elementHandle();
        if (!elementHandle) {
          console.error("Failed to get element handle");
          return false;
        }
        await elementHandle.focus();

        const rect = await elementHandle.evaluate((el: Element) => {
          const { x, y, height } = el.getBoundingClientRect();
          return { x, y, height };
        });
        await VisualEffects.showInputCursor(
          this.page,
          rect.x,
          rect.y,
          rect.height
        );

        await elementHandle.evaluate((el: HTMLInputElement) => {
          el.value = "";
          el.dispatchEvent(new Event("input", { bubbles: true }));
        });

        await elementHandle.type(action.args.text);
        await this.page.waitForFunction(
          () => document.readyState === "complete",
          { timeout: 10000 }
        );
        return true;
      }

      if (isNavigateAction(action)) {
        await this.page.goto(action.args.url);
        await this.page.waitForFunction(
          () => document.readyState === "complete",
          { timeout: 10000 }
        );
        return true;
      }

      if (isSwitchTabAction(action)) {
        try {
          await chrome.tabs.update(parseInt(action.args.tab_id), {
            active: true,
          });
          return true;
        } catch (error) {
          console.error("Error switching tab:", error);
          return false;
        }
      }

      if (isBackAction(action)) {
        await this.page.goBack();
        await this.page.waitForFunction(
          () => document.readyState === "complete",
          { timeout: 10000 }
        );
        return true;
      }
      if (isForwardAction(action)) {
        await this.page.goForward();
        await this.page.waitForFunction(
          () => document.readyState === "complete",
          { timeout: 10000 }
        );
        return true;
      }

      if (isKeyboardAction(action)) {
        try {
          await VisualEffects.showKeyboardEffect(this.page, action.args.keys);
          await this.page.keyboard.press(action.args.keys as any);
          await this.page.waitForFunction(
            () => document.readyState === "complete",
            { timeout: 10000 }
          );
          await VisualEffects.showLoadingState(this.page);
          return true;
        } catch (error) {
          console.error("Error executing keyboard action:", error);
          return false;
        }
      }

      if (isWaitAction(action)) {
        const waitTime = action.args.duration;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return true;
      }

      console.error(`Unsupported action type: ${JSON.stringify(action)}`);
      return false;
    } catch (error) {
      console.error("Error executing action:", error);
      return false;
    }
  }
}

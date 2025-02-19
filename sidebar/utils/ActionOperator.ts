import type { Page, KeyInput } from "puppeteer-core/lib/types";
import { Action } from "../types/api";
import { nodeMap } from "./pageCapture";
import { VisualEffects } from "./visualEffects";

export class ActionOperator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async executeAction(action: Action): Promise<boolean> {
    try {
      await VisualEffects.showLoadingState(this.page);

      switch (Object.keys(action)[0]) {
        case 'click':
          return this.executeClickAction(action.click!);
        case 'input':
          return this.executeInputAction(action.input!);
        case 'navigate':
          return this.executeNavigateAction(action.navigate!);
        case 'switch_tab':
          return this.executeSwitchTabAction(action.switch_tab!);
        case 'back':
          return this.executeBackAction();
        case 'forward':
          return this.executeForwardAction();
        case 'keyboard':
          return this.executeKeyboardAction(action.keyboard!);
        case 'wait':
          return this.executeWaitAction(action.wait!);
        default:
          console.error(`Unsupported action type: ${JSON.stringify(action)}`);
          return false;
      }
    } catch (error) {
      console.error("Error executing action:", error);
      return false;
    }
  }

  private async executeClickAction(click: NonNullable<Action['click']>): Promise<boolean> {
    const node = nodeMap.get(click.id);
    if (!node) {
      console.error(`Node not found for target: ${click.id}`);
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
    
    await elementHandle.hover();

    await VisualEffects.showClickEffect(
      this.page,
      rect.x + rect.width / 2,
      rect.y + rect.height / 2
    );

    await elementHandle.click();

    await this.waitForPageLoad();
    return true;
  }

  private async executeInputAction(input: NonNullable<Action['input']>): Promise<boolean> {
    const node = nodeMap.get(input.id);
    if (!node) {
      console.error(`Node not found for target: ${input.id}`);
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

    await elementHandle.type(input.text);
    await this.waitForPageLoad();
    return true;
  }

  private async executeNavigateAction(navigate: NonNullable<Action['navigate']>): Promise<boolean> {
    await this.page.goto(navigate.url);
    await this.waitForPageLoad();
    return true;
  }

  private async executeSwitchTabAction(switchTab: NonNullable<Action['switch_tab']>): Promise<boolean> {
    try {
      await chrome.tabs.update(parseInt(switchTab.tab_id), { active: true });
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error("Error switching tab:", error);
      return false;
    }
  }

  private async executeBackAction(): Promise<boolean> {
    await this.page.goBack();
    await this.waitForPageLoad();
    return true;
  }

  private async executeForwardAction(): Promise<boolean> {
    await this.page.goForward();
    await this.waitForPageLoad();
    return true;
  }

  private async executeKeyboardAction(keyboard: NonNullable<Action['keyboard']>): Promise<boolean> {
    try {
      const key = keyboard.key || keyboard.keys;
      if (!key) {
        console.error("No key specified for keyboard action");
        return false;
      }
      await VisualEffects.showKeyboardEffect(this.page, key);
      await this.page.keyboard.press(key as KeyInput);
      await this.waitForPageLoad();
      await VisualEffects.showLoadingState(this.page);
      return true;
    } catch (error) {
      console.error("Error executing keyboard action:", error);
      return false;
    }
  }

  private async executeWaitAction(wait: NonNullable<Action['wait']>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, wait.duration));
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  private async waitForPageLoad(): Promise<void> {
    await this.page.waitForFunction(
      () => document.readyState === "complete",
      { timeout: 10000 }
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

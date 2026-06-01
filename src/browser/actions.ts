import type { Page } from "puppeteer-core/lib/esm/puppeteer/api/Page.js";
import type { KeyInput } from "puppeteer-core/lib/esm/puppeteer/common/USKeyboardLayout.js";
import { getWaitDuration, type AgentAction } from "../shared/actions";
import type { ActionResult } from "../shared/types";
import { VisualEffects } from "../../sidebar/utils/visualEffects";

export interface ActionExecutionContext {
  page: Page;
  nodeMap: Map<string, any>;
  reconnect: () => Promise<Page>;
  attempt: number;
}

export async function executeAction(
  action: AgentAction,
  context: ActionExecutionContext,
): Promise<ActionResult> {
  const started = performance.now();
  try {
    await VisualEffects.showLoadingState(context.page);
    if ("click" in action) {
      await clickElement(action.click.id, context);
    } else if ("input" in action) {
      await inputText(action.input.id, action.input.text, context);
    } else if ("navigate" in action) {
      await context.page.goto(action.navigate.url, { waitUntil: "domcontentloaded" });
      await waitForSettledPage(context.page);
    } else if ("switch_tab" in action) {
      await chrome.tabs.update(Number(action.switch_tab.tab_id), { active: true });
      context.page = await context.reconnect();
      await waitForSettledPage(context.page);
    } else if ("back" in action) {
      await context.page.goBack({ waitUntil: "domcontentloaded" });
      await waitForSettledPage(context.page);
    } else if ("forward" in action) {
      await context.page.goForward({ waitUntil: "domcontentloaded" });
      await waitForSettledPage(context.page);
    } else if ("keyboard" in action) {
      const key = action.keyboard.key || action.keyboard.keys;
      if (!key) throw new Error("Keyboard action is missing a key");
      await VisualEffects.showKeyboardEffect(context.page, key);
      await context.page.keyboard.press(key as KeyInput);
      await waitForSettledPage(context.page);
    } else if ("wait" in action) {
      await delay(getWaitDuration(action.wait));
    }

    return {
      action,
      success: true,
      description: getActionDescription(action, true),
      durationMs: Math.round(performance.now() - started),
      attempt: context.attempt,
    };
  } catch (error) {
    return {
      action,
      success: false,
      description: getActionDescription(action, false),
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - started),
      attempt: context.attempt,
    };
  }
}

async function clickElement(id: string, context: ActionExecutionContext): Promise<void> {
  const handle = await getElementHandle(id, context);
  const rect = await handle.evaluate((el: Element) => {
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x, y, width, height };
  });
  await handle.hover();
  await VisualEffects.showClickEffect(context.page, rect.x + rect.width / 2, rect.y + rect.height / 2);
  await handle.click();
  await waitForSettledPage(context.page);
}

async function inputText(id: string, text: string, context: ActionExecutionContext): Promise<void> {
  const handle = await getElementHandle(id, context);
  await handle.evaluate((el: HTMLInputElement | HTMLTextAreaElement) => {
    el.focus();
    el.value = "";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await handle.type(text);
  await waitForSettledPage(context.page);
}

async function getElementHandle(id: string, context: ActionExecutionContext): Promise<any> {
  const node = context.nodeMap.get(String(id)) ?? findFallbackNode(id, context.nodeMap);
  if (!node) throw new Error(`No accessible node found for id ${id}`);

  const handle = await node.elementHandle();
  if (!handle) throw new Error(`No DOM element handle found for id ${id}`);
  return handle;
}

function findFallbackNode(id: string, nodeMap: Map<string, any>): any | undefined {
  const normalized = id.toLowerCase();
  return [...nodeMap.values()].find((node) => {
    const name = String(node.name ?? "").toLowerCase();
    const role = String(node.role ?? "").toLowerCase();
    const description = String(node.description ?? "").toLowerCase();
    return name.includes(normalized) || role.includes(normalized) || description.includes(normalized);
  });
}

async function waitForSettledPage(page: Page): Promise<void> {
  try {
    await page.waitForFunction(() => document.readyState === "complete", { timeout: 8000 });
  } catch {
    await page.waitForFunction(() => document.readyState !== "loading", { timeout: 3000 }).catch(() => undefined);
  }
  await delay(400);
}

function getActionDescription(action: AgentAction, success: boolean): string {
  const status = success ? "completed" : "failed";
  if ("click" in action) return action.click.description || `Click ${status}`;
  if ("input" in action) return action.input.description || `Input ${status}`;
  if ("navigate" in action) return action.navigate.description || `Navigation ${status}`;
  if ("switch_tab" in action) return action.switch_tab.description || `Tab switch ${status}`;
  if ("back" in action) return action.back.description || `Back ${status}`;
  if ("forward" in action) return action.forward.description || `Forward ${status}`;
  if ("keyboard" in action) return action.keyboard.description || `Keyboard ${status}`;
  if ("wait" in action) return action.wait.description || `Wait ${status}`;
  if ("ask" in action) return action.ask.query;
  return action.done.message;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

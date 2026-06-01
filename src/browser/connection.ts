import { _connectToCdpBrowser } from "puppeteer-core/lib/esm/puppeteer/cdp/BrowserConnector.js";
import { ExtensionTransport } from "puppeteer-core/lib/esm/puppeteer/cdp/ExtensionTransport.js";
import type { Browser } from "puppeteer-core/lib/esm/puppeteer/api/Browser.js";
import type { Page } from "puppeteer-core/lib/esm/puppeteer/api/Page.js";

export interface BrowserConnection {
  browser: Browser;
  page: Page;
  tabId: number;
}

export async function connectToActiveTab(): Promise<BrowserConnection> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) throw new Error("No active tab found");

  const transport = await ExtensionTransport.connectTab(activeTab.id);
  const browser = await _connectToCdpBrowser(transport, "", { defaultViewport: null });
  const [page] = await browser.pages();
  if (!page) {
    await browser.disconnect();
    throw new Error("No page found for active tab");
  }

  return { browser, page, tabId: activeTab.id };
}

export async function disconnect(connection: BrowserConnection | null): Promise<void> {
  if (!connection) return;
  await connection.browser.disconnect();
}

export async function reconnectToActiveTab(
  current: BrowserConnection | null,
): Promise<BrowserConnection> {
  await disconnect(current);
  return connectToActiveTab();
}

export async function getCurrentWindowTabs(): Promise<
  Array<{ id: string; title: string; url: string; active: boolean }>
> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  return tabs.map((tab) => ({
    id: String(tab.id ?? ""),
    title: tab.title ?? "",
    url: tab.url ?? "",
    active: tab.active,
  }));
}

export async function getActiveTabUrl(): Promise<string> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return activeTab?.url ?? "Unknown URL";
}

import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import type { Browser, Page } from 'puppeteer-core/lib/types';

export interface DebuggerConnection {
  browser: Browser;
  page: Page;
}

export class DebuggerConnectionService {
  /**
   * Connect to the active tab and return browser and page objects
   */
  static async connect(): Promise<DebuggerConnection> {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) {
      throw new Error('No active tab found');
    }

    const browser = await connect({
      transport: await ExtensionTransport.connectTab(activeTab.id),
      defaultViewport: null,
    });
    
    const [page] = await browser.pages();
    if (!page) {
      throw new Error('No page found in browser');
    }
    
    return { browser, page };
  }

  /**
   * Safely disconnect from the browser
   */
  static async disconnect(browser: Browser): Promise<void> {
    await browser.disconnect();
  }
}
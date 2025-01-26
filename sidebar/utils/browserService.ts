import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';
import type { Browser, Page } from 'puppeteer-core';

/**
 * Service for managing browser connections and page interactions
 */
export class BrowserService {
  /**
   * Get the currently active tab and establish a connection
   */
  static async connectToActiveTab(): Promise<{ browser: Browser; page: Page }> {
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
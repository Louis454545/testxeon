import { connect, ExtensionTransport } from 'puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js';

export async function captureScreenshot(): Promise<string> {
  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id || !activeTab.url) {
      throw new Error('No active tab found');
    }

    // Connect to the tab
    const browser = await connect({
      transport: await ExtensionTransport.connectTab(activeTab.id),
    });
    
    const [page] = await browser.pages();
    
    // Take screenshot as base64
    const screenshot = await page.screenshot({
      encoding: 'base64',
      fullPage: true,
      type: 'png'
    });

    // Clean up browser connection
    await browser.disconnect();
    
    return `data:image/png;base64,${screenshot}`;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    throw error;
  }
}
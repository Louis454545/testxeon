import type { Page } from 'puppeteer-core';

export interface PageData {
  accessibility: any; // Accessibility snapshot type from Puppeteer
  screenshot: string; // Base64 encoded screenshot
}

/**
 * Service for capturing page data including screenshots and accessibility information
 */
export class PageCaptureService {
  /**
   * Capture both screenshot and accessibility snapshot from the page
   */
  static async capturePageData(page: Page): Promise<PageData> {
    const [accessibility, screenshot] = await Promise.all([
      page.accessibility.snapshot(),
      page.screenshot({ 
        encoding: 'base64',
        fullPage: true, 
        type: 'png' 
      })
    ]);

    return {
      accessibility,
      screenshot: screenshot as string
    };
  }
}
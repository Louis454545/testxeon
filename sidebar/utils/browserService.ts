import type { Browser, Page } from 'puppeteer-core/lib/types';
import { DebuggerConnectionService } from './debuggerConnection';

/**
 * Service for managing browser connections and page interactions
 */
export class BrowserService {
  /**
   * Get the currently active tab and establish a connection
   */
  static async connectToActiveTab(): Promise<{ browser: Browser; page: Page }> {
    return DebuggerConnectionService.connect();
  }

  /**
   * Safely disconnect from the browser
   */
  static async disconnect(browser: Browser): Promise<void> {
    return DebuggerConnectionService.disconnect(browser);
  }
}
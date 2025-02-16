import type { Page } from 'puppeteer-core/lib/types';
import { drawAccessibilityBoxes, removeAccessibilityBoxes } from './accessibilityOverlay';

export interface PageData {
  accessibility: any; // Snapshot d'accessibilité
  screenshot: string; // Screenshot encodé en base64
}

// Map pour stocker les nœuds d'accessibilité par nodeId
export const nodeMap = new Map<string, any>();

/**
 * Parcours le snapshot d'accessibilité et stocke chaque nœud dans nodeMap.
 */
function mapNodes(node: any) {
  nodeMap.set(String(node.id), node);
  if (node.children) {
    node.children.forEach(mapNodes);
  }
}

/**
 * Service pour capturer les données d'une page : screenshot et accessibilité.
 */
export class PageCaptureService {
  /**
   * Capture les données de la page :
   * - Snapshot d'accessibilité
   * - Screenshot avec bounding boxes
   */
  static async capturePageData(page: Page): Promise<PageData> {
    // Récupérer le snapshot d'accessibilité
    const accessibility = await page.accessibility.snapshot();
    console.log('Snapshot d\'accessibilité:', accessibility);

    // Recharger la map avec le snapshot actuel
    nodeMap.clear();
    if (accessibility) {
      mapNodes(accessibility);
      // Dessiner les bounding boxes en utilisant elementHandle()
      await drawAccessibilityBoxes(page, accessibility);
    }

    // Prendre un screenshot avec les bounding boxes visibles
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'png',
      //fullPage: true,
    });

    // Supprimer les bounding boxes après la capture
    await removeAccessibilityBoxes(page);

    return {
      accessibility,
      screenshot: screenshot as string,
    };
  }
}

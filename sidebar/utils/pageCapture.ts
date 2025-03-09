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
  // Assurer que l'ID est converti en chaîne de caractères
  const nodeId = String(node.id);
  nodeMap.set(nodeId, node);
  
  // Log pour le débogage
  console.log(`Mapping node ID: ${nodeId}`, node.role || node.name || 'unnamed');
  
  // Récursion pour les enfants
  if (node.children && Array.isArray(node.children)) {
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
      
      // Log pour débogage - vérifier le contenu du nodeMap
      console.log(`NodeMap contient ${nodeMap.size} nœuds`);
      console.log(`NodeMap contient l'ID 2? ${nodeMap.has('2')}`);
      
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

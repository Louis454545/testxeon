import type { Page } from 'puppeteer-core/lib/types';
import { DebuggerConnectionService } from './debuggerConnection';

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
   * Ajoute des bounding boxes sur les éléments accessibles en utilisant elementHandle().
   */
  private static async drawAccessibilityBoxes(page: Page, snapshot: any): Promise<void> {
    // Création d'un overlay pour dessiner les bounding boxes
    await page.evaluate(() => {
      if (!document.getElementById('accessibility-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'accessibility-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10000;
        `;
        document.body.appendChild(overlay);
      }
    });

    /**
     * Récupère l'élément à partir du nodeId et dessine une bounding box.
     */
    async function drawBox(node: any) {
      if (!node.id) {
        console.warn('Aucun nodeId disponible pour ce nœud :', node);
        return;
      }

      try {
        // Récupérer le nœud dans la map
        const storedNode = nodeMap.get(String(node.id));
        if (!storedNode) {
          console.error(`Node not found for target: ${node.id}`);
          return;
        }

        // Obtenir l'élément via elementHandle()
        const elementHandle = await storedNode.elementHandle();
        if (!elementHandle) {
          console.error(`Failed to get element handle for nodeId: ${node.id}`);
          return;
        }

        // Obtenir la bounding box de l'élément
        const rect = await elementHandle.evaluate((el: Element) => {
          const { x, y, width, height } = el.getBoundingClientRect();
          return { x, y, width, height };
        });

        if (!rect) {
          console.warn(`Aucune bounding box pour le nodeId: ${node.id}`);
          await elementHandle.dispose();
          return;
        }

        console.debug('Bounding box trouvée:', {
          id: node.id,
          role: node.role,
          name: node.name,
          bounds: rect,
        });

        // Ajouter la bounding box sur l'overlay
        await page.evaluate((data) => {
          const overlay = document.getElementById('accessibility-overlay');
          if (overlay) {
            const box = document.createElement('div');
            box.style.cssText = `
              position: absolute;
              left: ${data.bounds.x}px;
              top: ${data.bounds.y}px;
              width: ${data.bounds.width}px;
              height: ${data.bounds.height}px;
              border: 2px solid rgba(0, 150, 255, 0.5);
              background: rgba(0, 150, 255, 0.1);
              pointer-events: none;
              z-index: 10000;
            `;
            box.setAttribute('data-node-id', data.id);
            box.setAttribute('data-role', data.role || '');
            if (data.name) {
              box.setAttribute('data-name', data.name);
            }
            box.title = `${data.role}${data.name ? ': ' + data.name : ''}`;
            overlay.appendChild(box);
          }
        }, {
          bounds: rect,
          id: node.id,
          role: node.role,
          name: node.name,
        });

        await elementHandle.dispose();
      } catch (error) {
        console.error('Erreur lors du tracé de la bounding box:', {
          error,
          node: {
            id: node.id,
            role: node.role,
            name: node.name,
          },
        });
      }

      // Traiter récursivement les enfants du nœud
      if (node.children) {
        for (const child of node.children) {
          await drawBox(child);
        }
      }
    }

    if (snapshot) {
      await drawBox(snapshot);
    }
  }

  /**
   * Supprime les bounding boxes affichées sur la page.
   */
  private static async removeAccessibilityBoxes(page: Page): Promise<void> {
    await page.evaluate(() => {
      const overlay = document.getElementById('accessibility-overlay');
      if (overlay) {
        overlay.remove();
      }
    });
  }

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
      await this.drawAccessibilityBoxes(page, accessibility);
    }

    // Prendre un screenshot avec les bounding boxes visibles
    const screenshot = await page.screenshot({
      encoding: 'base64',
      type: 'png',
    });

    // Supprimer les bounding boxes après la capture
    // await this.removeAccessibilityBoxes(page);

    return {
      accessibility,
      screenshot: screenshot as string,
    };
  }
}

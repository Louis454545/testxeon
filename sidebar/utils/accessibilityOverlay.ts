import type { Page } from 'puppeteer-core/lib/types';
import { nodeMap } from './pageCapture';

const allowedRoles = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'scrollbar',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox'
]);

/**
 * Ajoute des bounding boxes sur les éléments accessibles en utilisant elementHandle().
 */
export async function drawAccessibilityBoxes(page: Page, snapshot: any): Promise<void> {
  // Création d'un overlay pour dessiner les bounding boxes
  await page.evaluate(() => {
    if (!document.getElementById('accessibility-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'accessibility-overlay';
      const docEl = document.documentElement;
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${docEl.scrollWidth}px;
        height: ${docEl.scrollHeight}px;
        pointer-events: none;
        z-index: 10000;
      `;
      document.body.appendChild(overlay);
    }
  });

  // Accumulation des informations pour toutes les bounding boxes
  const boxesData: Array<{
    id: string;
    role: string;
    bounds: { x: number; y: number; width: number; height: number };
  }> = [];

  // Collecte les données de chaque nœud (et ses enfants) de manière concurrente
  async function collectBoxData(node: any): Promise<void> {
    if (!node.id) return;
    
    // Vérifier si le rôle est dans la liste autorisée
    if (!allowedRoles.has(node.role?.toLowerCase())) {
      // Traiter quand même les enfants au cas où ils auraient un rôle valide
      if (node.children) {
        await Promise.all(node.children.map((child: any) => collectBoxData(child)));
      }
      return;
    }

    try {
      const storedNode = nodeMap.get(String(node.id));
      if (!storedNode) return;

      const elementHandle = await storedNode.elementHandle();
      if (!elementHandle) return;

      const rect = await elementHandle.evaluate((el: Element) => {
        const { top, left, width, height } = el.getBoundingClientRect();
        return { 
          x: left + window.scrollX, 
          y: top + window.scrollY, 
          width, 
          height 
        };
      });

      if (rect) {
        boxesData.push({ 
          id: node.id,
          role: node.role?.toLowerCase() || '',
          bounds: rect 
        });
      }

      await elementHandle.dispose();
    } catch (error) {
      console.error('Erreur bounding box:', error);
    }

    if (node.children) {
      await Promise.all(node.children.map((child: any) => collectBoxData(child)));
    }
  }

  if (snapshot) {
    await collectBoxData(snapshot);
  }

  // Ajoute toutes les bounding boxes en une seule évaluation pour accélérer
  if (boxesData.length > 0) {
    await page.evaluate((boxes: any[]) => {
      const getColor = (role: string) => {
        switch(role) {
          case 'button': return { border: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' };
          case 'link': return { border: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' };
          case 'textbox': 
          case 'searchbox': return { border: '#9C27B0', bg: 'rgba(156, 39, 176, 0.1)' };
          case 'checkbox': 
          case 'radio': return { border: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)' };
          case 'combobox': 
          case 'slider': return { border: '#E91E63', bg: 'rgba(233, 30, 99, 0.1)' };
          default: return { border: 'rgba(0, 150, 255, 0.5)', bg: 'rgba(0, 150, 255, 0.1)' };
        }
      };

      const overlay = document.getElementById('accessibility-overlay');
      if (overlay) {
        boxes.forEach(data => {
          const color = getColor(data.role);
          const box = document.createElement('div');
          box.style.cssText = `
            position: absolute;
            left: ${data.bounds.x}px;
            top: ${data.bounds.y}px;
            width: ${data.bounds.width}px;
            height: ${data.bounds.height}px;
            border: 2px solid ${color.border};
            background: ${color.bg};
            pointer-events: none;
            z-index: 10000;
          `;
          
          // Ajout du texte avec l'ID
          const idLabel = document.createElement('span');
          idLabel.textContent = data.id;
          idLabel.style.cssText = `
            position: absolute;
            top: -18px;
            left: -2px;
            font-family: monospace;
            font-size: 12px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 2px 4px;
            border-radius: 3px;
            white-space: nowrap;
          `;
          
          box.appendChild(idLabel);
          overlay.appendChild(box);
        });
      }
    }, boxesData);
  }
}

/**
 * Supprime les bounding boxes affichées sur la page.
 */
export async function removeAccessibilityBoxes(page: Page): Promise<void> {
  await page.evaluate(() => {
    const overlay = document.getElementById('accessibility-overlay');
    if (overlay) {
      overlay.remove();
    }
  });
}
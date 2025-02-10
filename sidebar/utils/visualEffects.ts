// Déclarer le type global pour window._lastCursorPosition
declare global {
  interface Window {
    _lastCursorPosition: { x: string; y: string };
    _cursorObserver?: MutationObserver;
  }
}

export class VisualEffects {
  private static cursor: HTMLDivElement | null = null;
  private static currentPosition = { x: 0, y: 0 };

  private static async initCursor(page: any) {
    await page.evaluate(() => {
      const oldCursor = document.querySelector('#visual-cursor');
      if (oldCursor) {
        oldCursor.remove();
      }

      // Nettoyer l'ancien observer s'il existe
      if (window._cursorObserver) {
        window._cursorObserver.disconnect();
      }

      const cursor = document.createElement('div');
      cursor.id = 'visual-cursor';
      Object.assign(cursor.style, {
        position: 'fixed',
        width: '20px',
        height: '20px',
        backgroundColor: 'rgba(100, 100, 100, 0.9)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '999999',
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.3s ease-out',
        left: '50%',
        top: '50%'
      });

      // Style pour la transition entre les pages
      const style = document.createElement('style');
      style.textContent = `
        #visual-cursor {
          transition: all 0.3s ease-out;
        }
        #visual-cursor.loading {
          width: 30px !important;
          height: 30px !important;
          background-color: rgba(100, 100, 100, 0.5) !important;
        }
        #visual-cursor.keyboard-press {
          transform: translate(-50%, -50%) scale(1.2);
          transition: transform 0.1s ease-out;
        }
      `;
      document.head.appendChild(style);

      // Observer pour maintenir le curseur et sa position
      const observer = new MutationObserver(() => {
        if (!document.querySelector('#visual-cursor')) {
          const newCursor = cursor.cloneNode(true) as HTMLElement;
          // Restaurer la dernière position connue
          newCursor.style.left = window._lastCursorPosition?.x || '50%';
          newCursor.style.top = window._lastCursorPosition?.y || '50%';
          document.body.appendChild(newCursor);
        }
      });

      // Sauvegarder l'observer pour le nettoyage ultérieur
      window._cursorObserver = observer;

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Sauvegarder la position initiale
      window._lastCursorPosition = { x: '50%', y: '50%' };
      
      document.body.appendChild(cursor);
      return cursor;
    });
  }

  static async showClickEffect(page: any, x: number, y: number) {
    await this.initCursor(page);
    
    await page.evaluate(({x, y}: {x: number, y: number}) => {
      const cursor = document.querySelector('#visual-cursor') as HTMLElement;
      if (cursor) {
        // Sauvegarder la nouvelle position
        window._lastCursorPosition = { x: `${x}px`, y: `${y}px` };
        
        cursor.classList.remove('loading');
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      }
    }, {x, y});
  }

  static async showInputCursor(page: any, x: number, y: number, height: number) {
    await this.initCursor(page);
    
    await page.evaluate(({x, y, height}: {x: number, y: number, height: number}) => {
      const cursor = document.querySelector('#visual-cursor') as HTMLElement;
      if (cursor) {
        // Sauvegarder la nouvelle position
        window._lastCursorPosition = { x: `${x}px`, y: `${y + height/2}px` };
        
        cursor.classList.remove('loading');
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y + height/2}px`;
      }
    }, {x, y, height});
  }

  // Nouvelle méthode pour montrer l'état de chargement
  static async showLoadingState(page: any) {
    await page.evaluate(() => {
      const cursor = document.querySelector('#visual-cursor') as HTMLElement;
      if (cursor) {
        cursor.classList.add('loading');
        cursor.style.left = '50%';
        cursor.style.top = '50%';
        window._lastCursorPosition = { x: '50%', y: '50%' };
      }
    });
  }

  static async showKeyboardEffect(page: any, key: string) {
    await this.initCursor(page);
    
    await page.evaluate((key: string) => {
      const cursor = document.querySelector('#visual-cursor') as HTMLElement;
      if (cursor) {
        // Position the cursor at the center
        cursor.style.left = '50%';
        cursor.style.top = '50%';
        window._lastCursorPosition = { x: '50%', y: '50%' };
        
        // Add key indicator
        cursor.textContent = key;
        cursor.style.backgroundColor = 'rgba(0, 150, 255, 0.8)';
        cursor.style.color = 'white';
        cursor.style.display = 'flex';
        cursor.style.alignItems = 'center';
        cursor.style.justifyContent = 'center';
        cursor.style.fontSize = '12px';
        cursor.style.padding = '4px';
        cursor.style.minWidth = '24px';
        cursor.style.minHeight = '24px';
        
        // Animate
        cursor.classList.add('keyboard-press');
        
        // Reset after animation
        setTimeout(() => {
          cursor.textContent = '';
          cursor.style.backgroundColor = 'rgba(100, 100, 100, 0.9)';
          cursor.classList.remove('keyboard-press');
        }, 500);
      }
    }, key);
  }
}
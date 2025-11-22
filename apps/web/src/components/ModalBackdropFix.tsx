'use client';

import { useEffect } from 'react';

/**
 * ModalBackdropFix Component
 * 
 * Adds a dark overlay when CDP modals are open to ensure content behind is obscured.
 * This is a fallback in case Radix UI backdrop doesn't render properly.
 */
export function ModalBackdropFix() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Check if any dialog is present
      const hasDialog = document.querySelector('[role="dialog"]') !== null;
      
      if (hasDialog) {
        // Add overlay to body
        if (!document.getElementById('modal-backdrop-overlay')) {
          const overlay = document.createElement('div');
          overlay.id = 'modal-backdrop-overlay';
          overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 99997;
            pointer-events: none;
          `;
          document.body.appendChild(overlay);
        }
      } else {
        // Remove overlay when dialog closes
        const overlay = document.getElementById('modal-backdrop-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    });

    // Observe body for dialog additions/removals
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      // Cleanup overlay on unmount
      const overlay = document.getElementById('modal-backdrop-overlay');
      if (overlay) {
        overlay.remove();
      }
    };
  }, []);

  return null;
}


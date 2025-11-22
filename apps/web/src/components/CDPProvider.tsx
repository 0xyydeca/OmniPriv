'use client';

/**
 * CDPProvider wrapper component
 * 
 * Configures CDP React Provider with authentication enabled.
 * This enables gasless, self-custodial wallets via email/social auth.
 * 
 * CDPReactProvider automatically wraps CDPHooksProvider internally,
 * which provides the context needed for useEvmAddress, useIsSignedIn, etc.
 */

import { CDPReactProvider } from '@coinbase/cdp-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  // Get projectId from environment variable
  // This is your CDP App ID from https://portal.cdp.coinbase.com/
  // In Next.js, NEXT_PUBLIC_* vars are embedded at build time
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;

  // Force CDP modals above navbar by injecting styles dynamically
  // Only run on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const style = document.createElement('style');
    style.id = 'cdp-modal-z-index-fix';
    style.textContent = `
      [data-radix-dialog-content],
      div[role="dialog"] {
        z-index: 99999 !important;
        position: fixed !important;
      }
      [data-radix-portal] {
        z-index: 99999 !important;
      }
    `;
    
    // Only append if not already added
    if (!document.getElementById('cdp-modal-z-index-fix')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('cdp-modal-z-index-fix');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Only initialize CDP if we have a valid project ID
  // Using 'placeholder' causes API fetch errors because it's not a valid App ID
  if (!projectId || projectId.trim() === '') {
    // If CDP is not configured, just render children without CDP provider
    // This prevents the "Failed to fetch" errors
    return <>{children}</>;
  }

  // Render CDPReactProvider with valid projectId
  // CDPReactProvider internally wraps CDPHooksProvider which provides the hooks context
  return (
    <CDPReactProvider
      config={{
        projectId: projectId,
        ethereum: {
          createOnLogin: 'eoa', // Create EVM account on login
        },
        authMethods: ['email'], // Enable email authentication
      }}
    >
      {children}
    </CDPReactProvider>
  );
}


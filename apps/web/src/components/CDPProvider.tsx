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

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  // Get projectId from environment variable
  // This is your CDP App ID from https://portal.cdp.coinbase.com/
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;

  // Always render CDPReactProvider to ensure CDPHooksProvider context is available
  // CDPReactProvider internally wraps CDPHooksProvider which provides the hooks context
  // If projectId is missing, it will still initialize but features may not work
  return (
    <CDPReactProvider
      config={{
        projectId: projectId || 'placeholder', // Required config field
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


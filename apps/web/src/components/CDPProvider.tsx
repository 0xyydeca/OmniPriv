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

  // Debug logging (remove in production)
  if (typeof window !== 'undefined') {
    console.log('[CDPProvider] Initializing with projectId:', projectId ? `${projectId.substring(0, 10)}...` : 'NOT SET');
    console.log('[CDPProvider] Current origin:', window.location.origin);
    
    // Warn if origin might not be whitelisted
    if (window.location.origin.includes('localhost')) {
      console.warn('[CDPProvider] Using localhost - ensure this domain is whitelisted in CDP Portal');
      console.warn('[CDPProvider] Required domain:', window.location.origin);
    }
  }

  // Only initialize CDP if we have a valid project ID
  // Using 'placeholder' or empty string causes API fetch errors because it's not a valid App ID
  if (!projectId || projectId.trim() === '') {
    // If CDP is not configured, just render children without CDP provider
    // This prevents the "Failed to fetch" errors
    console.warn('[CDPProvider] CDP_APP_ID not configured. CDP features will be disabled.');
    return <>{children}</>;
  }

  // Validate projectId format (should be a non-empty string)
  if (projectId.length < 10) {
    console.error('[CDPProvider] CDP_APP_ID appears to be invalid. Expected a longer string from CDP Portal.');
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


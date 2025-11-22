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
  // Get appId (projectId) and targetChainId from environment variables
  // This matches the documentation pattern: appId={process.env.NEXT_PUBLIC_CDP_APP_ID} targetChainId={84532}
  // Wrong appId or chainId blocks auth, so these must be correct
  const appId = process.env.NEXT_PUBLIC_CDP_APP_ID;
  const targetChainId = Number(process.env.NEXT_PUBLIC_TARGET_CHAIN) || 84532; // Default to Base Sepolia (84532)

  // Only initialize CDP if we have a valid app ID
  // Wrong appId blocks auth - must be valid CDP App ID from https://portal.cdp.coinbase.com/
  if (!appId || appId.trim() === '') {
    // If CDP is not configured, just render children without CDP provider
    // This prevents the "Failed to fetch" errors
    console.warn('CDP_APP_ID not configured. CDP features will be disabled.');
    return <>{children}</>;
  }

  // Render CDPReactProvider with appId and targetChainId
  // CDPReactProvider internally wraps CDPHooksProvider which provides the hooks context
  // This wrapper provides context for wallet hooks; wrong appId or chainId blocks auth
  return (
    <CDPReactProvider
      config={{
        projectId: appId, // Same as appId in docs - this is your CDP App ID
        ethereum: {
          createOnLogin: 'eoa', // Create EVM account on login
        },
        authMethods: ['email'], // Enable email authentication
        // Note: targetChainId is configured via environment variable
        // Chain ID 84532 = Base Sepolia (default)
      }}
    >
      {children}
    </CDPReactProvider>
  );
}


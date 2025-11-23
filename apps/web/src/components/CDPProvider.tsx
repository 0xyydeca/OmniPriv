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
    const currentOrigin = window.location.origin;
    const projectIdDisplay = projectId && projectId.trim() !== '' 
      ? `${projectId.substring(0, 10)}...` 
      : 'NOT SET';
    console.log('[CDPProvider] Initializing with projectId:', projectIdDisplay);
    console.log('[CDPProvider] Current origin:', currentOrigin);
    
    // Detailed CORS diagnostic info
    if (currentOrigin.includes('localhost')) {
      console.warn('[CDPProvider] ⚠️  Localhost detected - CORS troubleshooting:');
      console.warn('[CDPProvider] 1. Verify in CDP Portal: Project Settings → Whitelisted Origins');
      console.warn('[CDPProvider] 2. Required format (exact match):', currentOrigin);
      console.warn('[CDPProvider]    - Must include: http:// (not https://)');
      console.warn('[CDPProvider]    - Must include port number (e.g., :3002)');
      console.warn('[CDPProvider]    - No trailing slash');
      console.warn('[CDPProvider] 3. Project ID to verify:', projectId || 'NOT SET');
      console.warn('[CDPProvider] 4. If whitelisted but still failing:');
      console.warn('[CDPProvider]    - Wait 1-5 minutes for propagation');
      console.warn('[CDPProvider]    - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
      console.warn('[CDPProvider]    - Try incognito mode');
      console.warn('[CDPProvider]    - Clear browser cache');
    }
  }

  // Only initialize CDP if we have a valid project ID
  // Using 'placeholder' or empty string causes API fetch errors because it's not a valid App ID
  if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
    // If CDP is not configured, just render children without CDP provider
    // This prevents the "Failed to fetch" errors
    console.warn('[CDPProvider] CDP_APP_ID not configured. CDP features will be disabled.');
    return <>{children}</>;
  }

  // Validate projectId format (should be a non-empty string)
  const trimmedProjectId = projectId.trim();
  if (trimmedProjectId.length < 10) {
    console.error('[CDPProvider] CDP_APP_ID appears to be invalid. Expected a longer string from CDP Portal.');
    return <>{children}</>;
  }

  // Render CDPReactProvider with valid projectId
  // CDPReactProvider internally wraps CDPHooksProvider which provides the hooks context
  return (
    <CDPReactProvider
      config={{
        projectId: trimmedProjectId,
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


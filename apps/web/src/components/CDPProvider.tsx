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

// TODO: Install @coinbase/cdp-react package
// import { CDPReactProvider } from '@coinbase/cdp-react';
import type { ReactNode } from 'react';

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  // Get projectId from environment variable
  // This is your CDP App ID from https://portal.cdp.coinbase.com/
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;

  // TODO: Uncomment when @coinbase/cdp-react is installed
  // return (
  //   <CDPReactProvider
  //     config={{
  //       projectId: projectId || 'placeholder',
  //       ethereum: {
  //         createOnLogin: 'eoa',
  //       },
  //       authMethods: ['email'],
  //     }}
  //   >
  //     {children}
  //   </CDPReactProvider>
  // );
  
  // Temporary: Just pass through children
  return <>{children}</>;
}


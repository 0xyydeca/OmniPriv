'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { config } from '@/lib/wagmi';
// TODO: When @coinbase/cdp-sdk/react export is available, uncomment:
// import { CDPProvider } from '@coinbase/cdp-sdk/react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30000,
      },
    },
  }));

  // CDP Provider configuration
  // Get CDP App ID from: https://portal.cdp.coinbase.com/
  const cdpAppId = process.env.NEXT_PUBLIC_CDP_APP_ID;
  const targetChainId = Number(process.env.NEXT_PUBLIC_TARGET_CHAIN) || 84532; // Default to Base Sepolia

  // Add error boundary for wagmi config
  try {
    const content = (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );

    // TODO: Wrap with CDPProvider when @coinbase/cdp-sdk/react export is available
    // The export doesn't exist in @coinbase/cdp-sdk v1.38.6
    // When available, replace content with:
    // return (
    //   <CDPProvider
    //     appId={cdpAppId!}
    //     targetChainId={targetChainId}
    //     theme="dark"
    //   >
    //     {content}
    //   </CDPProvider>
    // );

    return content;
  } catch (error) {
    console.error('Error initializing WagmiProvider:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-gray-400">Failed to initialize wallet provider. Check console for details.</p>
        </div>
      </div>
    );
  }
}


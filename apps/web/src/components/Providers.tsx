'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { config } from '@/lib/wagmi';

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

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // If no valid Privy App ID, show a simple message
  if (!privyAppId || privyAppId === 'placeholder-app-id' || privyAppId === 'your_privy_app_id_here') {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              PrivID Setup Required
            </h1>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                To use PrivID's wallet features, you need a <strong>FREE</strong> Privy App ID.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Quick Setup (2 minutes):</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to <a href="https://dashboard.privy.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">dashboard.privy.io</a></li>
                  <li>Sign up (free) and create a new app</li>
                  <li>Copy your App ID</li>
                  <li>Update <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:</li>
                </ol>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div># Edit apps/web/.env.local</div>
                <div className="mt-2">NEXT_PUBLIC_PRIVY_APP_ID=your_actual_app_id</div>
              </div>

              <p className="text-sm text-gray-600">
                Then the dev server will automatically reload with full functionality!
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm">
                  <strong>Without Privy:</strong> You can still explore the{' '}
                  <a href="https://github.com/yourusername/privid" className="text-blue-600 hover:underline">
                    code on GitHub
                  </a>{' '}
                  and read the documentation below.
                </p>
              </div>
            </div>
          </div>
        </div>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#0ea5e9',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [
          {
            id: 84532,
            name: 'Base Sepolia',
            network: 'base-sepolia',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://sepolia.base.org'] },
              public: { http: ['https://sepolia.base.org'] },
            },
            blockExplorers: {
              default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
            },
            testnet: true,
          },
          {
            id: 44787,
            name: 'Celo Alfajores',
            network: 'celo-alfajores',
            nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://alfajores-forno.celo-testnet.org'] },
              public: { http: ['https://alfajores-forno.celo-testnet.org'] },
            },
            blockExplorers: {
              default: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
            },
            testnet: true,
          },
        ],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}


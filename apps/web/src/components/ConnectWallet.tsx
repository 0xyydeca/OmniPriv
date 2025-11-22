'use client';

// TODO: Replace with real CDP integration when packages are installed
// import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
// import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';

/**
 * ConnectWallet component - Placeholder for CDP Embedded Wallet integration
 * 
 * This is a temporary placeholder until CDP packages are installed.
 * In production, this will use CDP hooks for auth-aware flow with email authentication.
 * 
 * Based on CDP documentation pattern:
 * https://docs.cdp.coinbase.com/embedded-wallets/react-components
 */
export default function ConnectWallet() {
  // Placeholder state - replace with real CDP hooks
  const isConnected = false;
  const address = null as string | null;

  return (
    <div className="flex items-center gap-3">
      {isConnected && address && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-200">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
      )}
      <button
        onClick={() => alert('CDP wallet integration coming soon!\n\nFor MVP demo, wallet features are stubbed.\n\nGet CDP App ID from: https://portal.cdp.coinbase.com')}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isConnected ? 'Disconnect' : 'Connect with CDP'}
      </button>
    </div>
  );
}

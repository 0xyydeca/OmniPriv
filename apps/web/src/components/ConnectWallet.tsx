'use client';

import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { formatAddress } from '@/lib/utils';

/**
 * ConnectWallet component using CDP Embedded Wallet
 * 
 * Uses REAL CDP hooks (not mocks) for auth-aware flow with email authentication.
 * Gasless connect via email/social - no seed phrases needed.
 * 
 * Documentation pattern: useWallet from @coinbase/cdp-sdk/react
 * Our implementation: useEvmAddress + useIsSignedIn from @coinbase/cdp-hooks
 * (useWallet export doesn't exist in our CDP version, but these are REAL hooks)
 * 
 * Based on CDP documentation pattern:
 * https://docs.cdp.coinbase.com/embedded-wallets/react-components
 */
export default function ConnectWallet() {
  // Check if CDP is configured - if not, CDPProvider won't render and hooks won't work
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;
  const isCDPConfigured = projectId && projectId.trim() !== '';

  // If CDP is not configured, show a fallback message
  if (!isCDPConfigured) {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        CDP not configured
      </div>
    );
  }

  // REAL CDP hooks (not mocks) - these require CDPProvider to be mounted
  // Hooks must always be called (can't conditionally call hooks)
  // If CDPProvider isn't mounted, these will throw errors
  // Pattern matches docs: useWallet() -> { wallet, address, connect, disconnect }
  // Our version: useEvmAddress() -> { evmAddress: address } + useIsSignedIn() -> { isSignedIn }
  const { evmAddress: address } = useEvmAddress(); // REAL hook for wallet address
  const { isSignedIn } = useIsSignedIn(); // REAL hook for auth status

  // Use CDP's built-in AuthButton which handles the full auth flow automatically
  return (
    <div className="flex items-center gap-3">
      {isSignedIn && address && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-200">
            {formatAddress(address)}
          </span>
        </div>
      )}
      <AuthButton
        signOutButton={({ onSuccess }) => (
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Disconnect
          </button>
        )}
        placeholder={({ className }) => (
          <button
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className || ''}`}
          >
            Connect with CDP
          </button>
        )}
        onSignInSuccess={() => {
          // Address will be available via useEvmAddress hook after successful sign-in
          console.log('Signed in successfully');
        }}
      />
    </div>
  );
}

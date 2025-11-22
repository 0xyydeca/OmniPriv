'use client';

/**
 * ShareCredential component
 * 
 * Uses CDP's x402 Facilitator for secure HTTP-based credential delegation.
 * Leverages your connected wallet for gasless, secure delegations.
 * 
 * Based on x402 protocol that CDP builds on:
 * https://github.com/coinbase/x402
 * 
 * Usage: Share a credential (e.g., KYC proof) to another address anonymously.
 */

import { useState } from 'react';
import { useX402 } from '@coinbase/cdp-hooks'; // For delegations
import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { formatAddress } from '@/lib/utils';

interface ShareCredentialProps {
  credentialId: string;
  onShared?: (address: string) => void;
}

export function ShareCredential({ credentialId, onShared }: ShareCredentialProps) {
  const [toAddress, setToAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // CDP hooks for wallet connection and signing
  const { evmAddress: address } = useEvmAddress(); // Get connected wallet address
  const { isSignedIn } = useIsSignedIn(); // Check if user is signed in
  const { delegate, isDelegating } = useX402(); // Hook for facilitator - handles appId automatically from CDPProvider context

  const handleShare = async () => {
    if (!toAddress) {
      setError('Please enter an address');
      return;
    }

    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address');
      return;
    }

    if (!isSignedIn || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      // Delegate credential access using x402 Facilitator
      // useX402 hook automatically uses appId from CDPProvider context
      // CDP's Facilitator handles secure HTTP-based delegations seamlessly
      await delegate({
        to: toAddress, // Recipient address
        resource: credentialId, // Credential ID (e.g., 'kyc-proof-123')
        amount: '0', // Gasless delegation
        chainId: 84532, // Base Sepolia
      });

      // Success - credential access delegated
      setSuccess(true);
      if (onShared) {
        onShared(toAddress);
      }
      
      // Reset form after a delay
      setTimeout(() => {
        setToAddress('');
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('x402 error:', error);
      setError(error.message || 'Failed to delegate credential');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="share-address" className="block text-sm font-medium text-gray-300 mb-2">
          Share with address
        </label>
        <input
          id="share-address"
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isDelegating}
        />
        {toAddress && (
          <p className="mt-1 text-xs text-gray-400">
            {formatAddress(toAddress)}
          </p>
        )}
      </div>

      <button
        onClick={handleShare}
        disabled={isDelegating || !toAddress || !isSignedIn || !address || success}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isDelegating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Delegating...
          </span>
        ) : success ? (
          '✓ Shared Successfully'
        ) : !isSignedIn || !address ? (
          'Connect Wallet to Share'
        ) : (
          'Share Anonymously'
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
          <p className="text-sm text-green-300">
            Credential access delegated to {formatAddress(toAddress)}
          </p>
        </div>
      )}
    </div>
  );
}


'use client';

/**
 * ShareCredential component
 * 
 * Demonstrates how to use CDP x402 for credential delegation.
 * This enables agentic sharing without pop-ups.
 * 
 * Usage: Call `delegateCredential(userAddress, 'kyc-proof-123')` on a "Share Anonymously" button.
 */

import { useState } from 'react';
// TODO: When @coinbase/cdp-sdk/react export is available, use this import:
// import { useWallet } from '@coinbase/cdp-sdk/react';
import { delegateCredential } from '@/lib/cdpX402';
import { formatAddress } from '@/lib/utils';

interface ShareCredentialProps {
  credentialId: string;
  onShared?: (address: string) => void;
}

export function ShareCredential({ credentialId, onShared }: ShareCredentialProps) {
  const [toAddress, setToAddress] = useState('');
  const [isDelegating, setIsDelegating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // TODO: When @coinbase/cdp-sdk/react export is available, use this:
  // const { wallet, connect } = useWallet();
  
  // Temporary: get wallet from localStorage (in real implementation, use useWallet hook)
  const getWallet = () => {
    if (typeof window === 'undefined') return null;
    const address = localStorage.getItem('cdp_wallet_address');
    if (!address) return null;
    
    // Mock wallet object - in real implementation, this comes from useWallet hook
    return {
      address,
      signMessage: async (message: string) => {
        // Placeholder - actual implementation will use CDP wallet signing
        console.log('Signing message:', message);
        return '0x' + '0'.repeat(128);
      },
    };
  };

  const handleShare = async () => {
    if (!toAddress) {
      setError('Please enter an address');
      return;
    }

    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid Ethereum address');
      return;
    }

    setIsDelegating(true);
    setError(null);
    setSuccess(false);

    try {
      const wallet = getWallet();
      
      // TODO: Replace with actual useWallet hook pattern:
      // if (!wallet) await connect();
      
      if (!wallet) {
        throw new Error('Please connect your wallet first');
      }

      const success = await delegateCredential(toAddress, credentialId, wallet);
      
      if (success) {
        setSuccess(true);
        if (onShared) {
          onShared(toAddress);
        }
        // Reset form after a delay
        setTimeout(() => {
          setToAddress('');
          setSuccess(false);
        }, 3000);
      } else {
        setError('Delegation verification failed');
      }
    } catch (error: any) {
      console.error('Failed to share credential:', error);
      setError(error.message || 'Failed to share credential');
    } finally {
      setIsDelegating(false);
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
        disabled={isDelegating || !toAddress || success}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {isDelegating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Delegating...
          </span>
        ) : success ? (
          '✓ Shared Successfully'
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


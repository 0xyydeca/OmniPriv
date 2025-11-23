'use client';

import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { formatEther } from 'viem';

/**
 * FundingGuide Component
 * 
 * Helps users fund their CDP embedded wallet with Base Sepolia testnet ETH.
 * Shows balance, faucet links, and funding instructions.
 */
export function FundingGuide() {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  // Get Base Sepolia balance
  const { data: balance, refetch } = useBalance({
    address: address as `0x${string}`,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasBalance = balance && balance.value > 0n;
  const balanceInEth = balance ? formatEther(balance.value) : '0';
  const needsFunding = !hasBalance || Number(balanceInEth) < 0.01;

  if (!address) {
    return null;
  }

  return (
    <div className={`p-6 rounded-lg border ${
      hasBalance 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
    }`}>
      {/* Balance Display */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
            Wallet Balance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Base Sepolia Testnet
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${
            hasBalance ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {balanceInEth.slice(0, 8)} ETH
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Wallet Address:</p>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-gray-900 dark:text-gray-100 flex-1 break-all">
            {address}
          </code>
          <button
            onClick={copyAddress}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Funding Instructions */}
      {needsFunding ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
            <span className="text-xl font-bold text-yellow-500">!</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Funding Required
              </p>
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                You need Base Sepolia ETH to add credentials and submit proofs.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Get Free Testnet ETH:
            </h4>
            
            {/* Faucet Options */}
            <div className="space-y-2">
              {/* Coinbase Faucet */}
              <a
                href="https://portal.cdp.coinbase.com/faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏦</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Coinbase Faucet (Recommended)</p>
                  <p className="text-xs text-blue-100">
                    Get 0.1 Base Sepolia ETH instantly
                  </p>
                </div>
                <span className="text-white/70 group-hover:text-white transition-colors">→</span>
              </a>

              {/* QuickNode Faucet */}
              <a
                href={`https://faucet.quicknode.com/base/sepolia?address=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">QuickNode Faucet</p>
                  <p className="text-xs text-purple-100">
                    Alternative faucet option
                  </p>
                </div>
                <span className="text-white/70 group-hover:text-white transition-colors">→</span>
              </a>

              {/* Alchemy Faucet */}
              <a
                href="https://www.alchemy.com/faucets/base-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all hover:scale-[1.02] group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔷</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Alchemy Faucet</p>
                  <p className="text-xs text-indigo-100">
                    Another reliable option
                  </p>
                </div>
                <span className="text-white/70 group-hover:text-white transition-colors">→</span>
              </a>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs space-y-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>Copy your wallet address above</li>
                <li>Click on any faucet link</li>
                <li>Paste your address and request ETH</li>
                <li>Wait 30-60 seconds for delivery</li>
                <li>Click "🔄 Refresh" to update balance</li>
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded">
          <span className="text-xl font-bold text-green-500">✓</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Wallet Funded!
            </p>
            <p className="text-xs text-green-800 dark:text-green-200 mt-1">
              You have sufficient ETH to add credentials and submit proofs.
            </p>
          </div>
        </div>
      )}

      {/* Compliance Budget Notice */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Production Note:</strong> In production, wallets would be pre-funded by our compliance treasury 
            using CDP Server Wallets. Users wouldn't need to visit faucets.
          </p>
        </div>
      </div>
    </div>
  );
}


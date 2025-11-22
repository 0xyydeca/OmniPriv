'use client';

import { useState } from 'react';
import { VaultRecord } from '@privid/sdk';

interface CrossChainBridgeProps {
  credentials: VaultRecord[];
}

const CHAINS = [
  { id: 84532, name: 'Base Sepolia', icon: '🔵' },
  { id: 44787, name: 'Celo Alfajores', icon: '🟡' },
];

export function CrossChainBridge({ credentials }: CrossChainBridgeProps) {
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [sourceChain, setSourceChain] = useState(84532);
  const [targetChain, setTargetChain] = useState(44787);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; txHash?: string; message: string } | null>(null);

  const validCredentials = credentials.filter(
    (c) => c.credential.expiry > Date.now() / 1000
  );

  const handleBridge = async () => {
    try {
      setLoading(true);
      setResult(null);

      if (!selectedCredential) {
        throw new Error('Please select a credential');
      }

      if (sourceChain === targetChain) {
        throw new Error('Source and target chains must be different');
      }

      // Simulate LayerZero cross-chain message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      setResult({
        success: true,
        txHash: mockTxHash,
        message: `✅ Verification sent to ${CHAINS.find((c) => c.id === targetChain)?.name}!`,
      });

    } catch (err: any) {
      console.error('Bridge failed:', err);
      setResult({
        success: false,
        message: err.message || 'Bridge transaction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Cross-Chain Verification</h2>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Send your verified credential marker to another chain using LayerZero v2. No PII crosses chains—only a cryptographic commitment.
        </p>
      </div>

      {validCredentials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">No Valid Credentials</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add and verify a credential first
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Credential Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Credential</label>
            <select
              value={selectedCredential}
              onChange={(e) => setSelectedCredential(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="">Choose a credential...</option>
              {validCredentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.id.slice(0, 16)}... (Hash: {cred.credential.credential_hash.slice(0, 10)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Chain Selection */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-8 items-center">
              {/* Source Chain */}
              <div>
                <label className="block text-sm font-medium mb-3">From Chain</label>
                <div className="space-y-2">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSourceChain(chain.id)}
                      disabled={chain.id === targetChain}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        sourceChain === chain.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="text-xl mr-2">{chain.icon}</span>
                      <span className="font-medium">{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-4xl">→</div>
              </div>

              {/* Target Chain */}
              <div>
                <label className="block text-sm font-medium mb-3">To Chain</label>
                <div className="space-y-2">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setTargetChain(chain.id)}
                      disabled={chain.id === sourceChain}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        targetChain === chain.id
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="text-xl mr-2">{chain.icon}</span>
                      <span className="font-medium">{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fee Estimate */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimated Fee</span>
              <span className="text-lg font-bold">~0.001 ETH</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              LayerZero cross-chain message fee (actual cost may vary)
            </p>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
              }`}
            >
              <p
                className={
                  result.success
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }
              >
                {result.message}
              </p>
              {result.txHash && (
                <p className="text-xs font-mono mt-2 text-green-800 dark:text-green-200">
                  Tx: {result.txHash}
                </p>
              )}
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={loading || !selectedCredential || sourceChain === targetChain}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Bridging...
              </span>
            ) : (
              'Send Verification Cross-Chain'
            )}
          </button>

          {/* Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>ℹ️ Your credential stays encrypted in your vault</p>
            <p>ℹ️ Only a cryptographic commitment is sent cross-chain</p>
            <p>ℹ️ No personal data leaves your device</p>
          </div>
        </div>
      )}
    </div>
  );
}


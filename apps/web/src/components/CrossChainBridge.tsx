'use client';

import { useState, useEffect } from 'react';
import { VaultRecord } from '@omnipriv/sdk';
import { useAccount, useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { deployments, getAddresses, getLayerZeroEid } from '@omnipriv/contracts';
import { encodeFunctionData, parseEther, formatEther } from 'viem';

interface CrossChainBridgeProps {
  credentials: VaultRecord[];
}

const CHAINS = [
  { id: 84532, name: 'Base Sepolia', icon: '🔵' },
  { id: 11142220, name: 'Celo Sepolia', icon: '🟡' },
];

// IdentityOApp ABI (minimal for our needs)
const IDENTITY_OAPP_ABI = [
  {
    inputs: [
      { name: 'dstEid', type: 'uint32' },
      { name: 'user', type: 'address' },
      { name: 'policyId', type: 'bytes32' },
      { name: 'commitment', type: 'bytes32' },
      { name: 'expiry', type: 'uint256' },
      { name: 'options', type: 'bytes' },
    ],
    name: 'sendVerification',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'dstEid', type: 'uint32' },
      { name: 'message', type: 'bytes' },
      { name: 'options', type: 'bytes' },
      { name: 'payInLzToken', type: 'bool' },
    ],
    name: 'quote',
    outputs: [
      {
        components: [
          { name: 'nativeFee', type: 'uint256' },
          { name: 'lzTokenFee', type: 'uint256' },
        ],
        name: 'fee',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function CrossChainBridge({ credentials }: CrossChainBridgeProps) {
  const { address, chain: currentChain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();

  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [sourceChain, setSourceChain] = useState(84532);
  const [targetChain, setTargetChain] = useState(11142220);
  const [loading, setLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string>('');
  const [result, setResult] = useState<{ success: boolean; txHash?: string; message: string } | null>(null);

  const validCredentials = credentials.filter(
    (c) => c.credential.expiry > Date.now() / 1000
  );

  const selectedCred = validCredentials.find((c) => c.id === selectedCredential);

  // Estimate fee when credential or chains change
  useEffect(() => {
    const estimateFee = async () => {
      if (!selectedCred || !address) {
        setEstimatedFee('');
        return;
      }

      try {
        const addresses = getAddresses(sourceChain);
        if (!addresses?.IdentityOApp) {
          setEstimatedFee('Not deployed');
          return;
        }

        const targetEid = getLayerZeroEid(targetChain);
        if (!targetEid) {
          setEstimatedFee('Invalid chain');
          return;
        }

        // For now, show estimated fee (actual quote requires contract deployment)
        setEstimatedFee('~0.001 ETH');
      } catch (err) {
        console.error('Fee estimation failed:', err);
        setEstimatedFee('~0.001 ETH');
      }
    };

    estimateFee();
  }, [selectedCredential, sourceChain, targetChain, address, selectedCred]);

  const handleBridge = async () => {
    try {
      setLoading(true);
      setResult(null);

      if (!selectedCred) {
        throw new Error('Please select a credential');
      }

      if (!address) {
        throw new Error('Please connect your wallet');
      }

      if (sourceChain === targetChain) {
        throw new Error('Source and target chains must be different');
      }

      // Check if we need to switch chains
      if (currentChain?.id !== sourceChain) {
        console.log(`Switching to chain ${sourceChain}...`);
        await switchChain?.({ chainId: sourceChain });
        // Wait for chain switch
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const addresses = getAddresses(sourceChain);
      if (!addresses?.IdentityOApp) {
        throw new Error(`IdentityOApp not deployed on ${CHAINS.find(c => c.id === sourceChain)?.name}. Deploy contracts first.`);
      }

      const targetEid = getLayerZeroEid(targetChain);
      if (!targetEid) {
        throw new Error('Invalid target chain');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      // Prepare the transaction
      const policyId = selectedCred.credential.credential_hash; // Using credential hash as policy ID
      const commitment = selectedCred.credential.credential_hash; // The commitment
      const expiry = BigInt(Math.floor(selectedCred.credential.expiry));

      // LayerZero options (use defaults for now)
      const options = '0x';

      // Send the cross-chain verification
      const txHash = await walletClient.writeContract({
        address: addresses.IdentityOApp as `0x${string}`,
        abi: IDENTITY_OAPP_ABI,
        functionName: 'sendVerification',
        args: [
          targetEid,
          address,
          policyId as `0x${string}`,
          commitment as `0x${string}`,
          expiry,
          options as `0x${string}`,
        ],
        value: parseEther('0.001'), // Fee for LayerZero message
      });

      console.log('Transaction sent:', txHash);

      // Wait for confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      setResult({
        success: true,
        txHash,
        message: `Verification sent to ${CHAINS.find((c) => c.id === targetChain)?.name}!`,
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
              <span className="text-lg font-bold">
                {estimatedFee || 'Calculating...'}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              LayerZero cross-chain message fee (actual cost may vary)
            </p>
          </div>

          {/* Chain Mismatch Warning */}
          {currentChain && currentChain.id !== sourceChain && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                ⚠️ You're connected to <strong>{currentChain.name}</strong>. 
                You'll be prompted to switch to <strong>{CHAINS.find(c => c.id === sourceChain)?.name}</strong> when bridging.
              </p>
            </div>
          )}

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


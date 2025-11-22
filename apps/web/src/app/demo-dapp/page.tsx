'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { optimismSepolia } from 'wagmi/chains';
import { OPTIMISM_SEPOLIA_CONTRACTS } from '@omnipriv/sdk/constants';
import { OMNIPRIV_VERIFIER_ABI } from '@/contracts/OmniPrivVerifier';
import { CheckCircleIcon, XCircleIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Mock Verified Badge contract ABI (simplified)
const BADGE_ABI = [{
  name: 'mint',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [],
  outputs: [],
}] as const;

// Mock badge contract address (you can deploy a real one later)
const BADGE_ADDRESS = '0x0000000000000000000000000000000000000000'; // Placeholder

export default function DemoDAppPage() {
  const { address, isConnected } = useAccount();
  const [policyId, setPolicyId] = useState<`0x${string}`>('0xage18_policy' as `0x${string}`);
  
  // Check verification status on Optimism Sepolia
  const { data: isVerified, isLoading, refetch } = useReadContract({
    address: OPTIMISM_SEPOLIA_CONTRACTS.OmniPrivVerifier,
    abi: OMNIPRIV_VERIFIER_ABI,
    functionName: 'isVerified',
    args: address && policyId ? [address, policyId] : undefined,
    chainId: optimismSepolia.id,
    query: {
      enabled: !!address && !!policyId,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  const { data: expiry } = useReadContract({
    address: OPTIMISM_SEPOLIA_CONTRACTS.OmniPrivVerifier,
    abi: OMNIPRIV_VERIFIER_ABI,
    functionName: 'getExpiry',
    args: address && policyId ? [address, policyId] : undefined,
    chainId: optimismSepolia.id,
    query: {
      enabled: !!address && !!policyId && !!isVerified,
    },
  });

  // Mock badge minting (would be real contract call in production)
  const [mintingBadge, setMintingBadge] = useState(false);
  const [badgeMinted, setBadgeMinted] = useState(false);

  const handleMintBadge = async () => {
    if (!isVerified) return;
    
    setMintingBadge(true);
    // Simulate minting delay
    setTimeout(() => {
      setMintingBadge(false);
      setBadgeMinted(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎮 Verified-Only Demo dApp
            </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This dApp checks your verification status on <strong>Optimism Sepolia</strong> without ever seeing your personal data.
            Only a boolean flag is checked: <code className="bg-gray-800 px-2 py-1 rounded">isVerified()</code>
            </p>
            </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl p-8 space-y-8">
          {/* Connection Status */}
          {!isConnected ? (
            <div className="text-center py-12">
              <LockClosedIcon className="w-20 h-20 mx-auto text-gray-500 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-200 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">
                Connect your wallet to check your verification status
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Go to Home to Connect
              </Link>
            </div>
          ) : (
            <>
              {/* Wallet Info */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Wallet</h3>
                <p className="font-mono text-gray-200">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Checking on Optimism Sepolia
                </p>
              </div>

              {/* Verification Status */}
              <div className={`rounded-xl p-6 border-2 transition-all ${
                isVerified
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-gray-900/50 border-gray-700'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-1">Verification Status</h3>
                    <p className="text-sm text-gray-400">
                      Policy: <code className="bg-gray-800 px-2 py-0.5 rounded text-xs">AGE18_ALLOWED_COUNTRIES_V1</code>
                    </p>
                  </div>
                  <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Refresh status"
                  >
                    <ArrowPathIcon className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {isLoading ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <ArrowPathIcon className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
                      <div>
                        <p className="font-semibold text-gray-300">Checking...</p>
                        <p className="text-sm text-gray-500">Querying Optimism Sepolia</p>
                </div>
                    </>
                  ) : isVerified ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
                      <div>
                        <p className="font-semibold text-green-400 text-xl">✅ Verified!</p>
                        <p className="text-sm text-gray-300">
                          You have access to this dApp
                        </p>
                        {expiry && (
                          <p className="text-xs text-gray-500 mt-1">
                            Valid until: {new Date(Number(expiry) * 1000).toLocaleString()}
                          </p>
                        )}
            </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <XCircleIcon className="w-8 h-8 text-gray-400" />
                </div>
                      <div>
                        <p className="font-semibold text-gray-300">Not Verified</p>
                        <p className="text-sm text-gray-500">
                          You need to verify via OmniPriv Vault first
                        </p>
                </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gated Action: Mint Badge */}
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">🏅</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">Verified User Badge</h3>
                    <p className="text-sm text-gray-400">Exclusive NFT for verified users</p>
            </div>
                </div>

                {isVerified ? (
                  <>
                    <p className="text-gray-300 mb-4">
                      Congratulations! You can now mint your exclusive "Verified User" badge NFT.
                    </p>
              <button
                      onClick={handleMintBadge}
                      disabled={mintingBadge || badgeMinted}
                      className={`
                        w-full py-4 rounded-lg font-semibold transition-all
                        ${badgeMinted
                          ? 'bg-green-600 cursor-not-allowed'
                          : mintingBadge
                          ? 'bg-purple-500 cursor-wait'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }
                        text-white flex items-center justify-center gap-2
                      `}
                    >
                      {mintingBadge ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          Minting...
                        </>
                      ) : badgeMinted ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Badge Minted! 🎉
                        </>
                      ) : (
                        '🏅 Mint Verified Badge'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 mb-4">
                      This action is only available to verified users.
                    </p>
                    <button
                      disabled
                      className="w-full py-4 bg-gray-700 text-gray-500 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <LockClosedIcon className="w-5 h-5" />
                      Badge Locked - Verify First
                    </button>
                    <Link
                      href="/dashboard"
                      className="block mt-3 text-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      → Go to OmniPriv Vault to Verify
                    </Link>
                  </>
                )}
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <h4 className="font-semibold text-gray-200 mb-2">🔐 Privacy Note</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  This dApp <strong>never sees</strong> your date of birth, country, or any personal information.
                  It only checks a simple boolean: <code className="bg-gray-800 px-2 py-0.5 rounded">isVerified(msg.sender, policyId)</code>.
                  Your privacy is preserved through zero-knowledge proofs and cross-chain verification.
                </p>
              </div>

              {/* Technical Details */}
              <details className="bg-gray-900/50 rounded-xl border border-gray-700">
                <summary className="p-6 cursor-pointer hover:bg-gray-800/50 transition-colors">
                  <span className="font-semibold text-gray-200">🔧 Technical Details (For Judges & Nerds)</span>
                </summary>
                <div className="px-6 pb-6 space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Origin Chain:</p>
                    <p className="text-gray-200">Base Sepolia (84532)</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Destination Chain:</p>
                    <p className="text-gray-200">Optimism Sepolia (11155420)</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">OmniPrivVerifier Contract:</p>
                    <p className="font-mono text-xs text-gray-300 break-all bg-gray-800 p-2 rounded">
                      {OPTIMISM_SEPOLIA_CONTRACTS.OmniPrivVerifier}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">How It Works:</p>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
                      <li>User generates ZK proof on Base Sepolia</li>
                      <li>Proof verified by ProofConsumer contract</li>
                      <li>LayerZero sends verification flag to Optimism</li>
                      <li>This dApp checks the flag on Optimism</li>
                      <li>Access granted based on boolean, not personal data</li>
                    </ol>
                  </div>
                </div>
              </details>
            </>
              )}
            </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-6 text-sm">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Home
          </Link>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            OmniPriv Vault →
          </Link>
        </div>
      </div>
    </div>
  );
}

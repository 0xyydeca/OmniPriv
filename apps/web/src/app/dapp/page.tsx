'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { optimismSepolia, baseSepolia } from 'wagmi/chains';
import { OPTIMISM_SEPOLIA_CONTRACTS } from '@omnipriv/sdk';
import { IDENTITY_OAPP_ABI, IDENTITY_OAPP_ADDRESS } from '@/contracts/IdentityOApp';
import { PROOF_CONSUMER_ABI, PROOF_CONSUMER_ADDRESS } from '@/contracts/ProofConsumer';
import { CheckCircleIcon, XCircleIcon, GiftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StatusCard } from '@/components/StatusCard';
import { DebugPanel } from '@/components/DebugPanel';
import { formatAddress, getBlockExplorerLink } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { ethers } from 'ethers';
import Link from 'next/link';

// 🎬 DEMO MODE for Hackathon Presentation
const DEMO_MODE = true; // ← Set to true for demo
const DEMO_WALLET = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143'; // Your CDP wallet

export default function DAppPage() {
  const { address: wagmiAddress } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { isSignedIn } = useIsSignedIn();
  const { showToast } = useToast();

  // Use CDP address if available, otherwise fall back to wagmi address
  const address = cdpAddress || wagmiAddress;

  // Mock policy ID (same as used in Vault)
  const policyId = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy')) as `0x${string}`;
  
  // Check verification status on Base Sepolia (origin chain)
  const { data: isVerifiedOnBase, isLoading: isLoadingBase, refetch: refetchBase } = useReadContract({
    address: PROOF_CONSUMER_ADDRESS,
    abi: PROOF_CONSUMER_ABI,
    functionName: 'isVerified',
    args: address && policyId ? [address as `0x${string}`, policyId] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!address && !!policyId,
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });
  
  // Check verification status on Optimism Sepolia (destination chain)
  const { data: isVerifiedOnOptimism, isLoading: isLoadingOptimism, refetch: refetchOptimism } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'isVerified',
    args: address && policyId ? [address as `0x${string}`, policyId] : undefined,
    chainId: optimismSepolia.id,
    query: {
      enabled: !!address && !!policyId,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Get full verification details from Optimism
  const { data: optimismVerification } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'getVerification',
    args: address && policyId ? [address as `0x${string}`, policyId] : undefined,
    chainId: optimismSepolia.id,
    query: {
      enabled: !!address && !!policyId && !!isVerifiedOnOptimism,
    },
  });

  // 🎬 DEMO MODE: Check if this is the demo wallet
  const isDemoUser = DEMO_MODE && address?.toLowerCase() === DEMO_WALLET.toLowerCase();
  
  // Determine overall status (with demo mode fallback)
  const realVerification = isVerifiedOnBase || isVerifiedOnOptimism;
  const isVerified = realVerification || isDemoUser;
  const isLoading = isLoadingBase || isLoadingOptimism;
  
  // Extract data from verification (prefer Optimism, fall back to Base, then demo)
  let expiry, sourceEid, timestamp, verificationSource;
  
  if (optimismVerification) {
    expiry = optimismVerification.expiry;
    sourceEid = optimismVerification.sourceEid;
    timestamp = optimismVerification.timestamp;
    verificationSource = 'Optimism Sepolia (via LayerZero)';
  } else if (baseVerification) {
    expiry = baseVerification;
    sourceEid = undefined;
    timestamp = undefined;
    verificationSource = 'Base Sepolia (origin chain)';
  } else if (isDemoUser) {
    // 🎬 DEMO MODE: Provide mock data
    const now = Math.floor(Date.now() / 1000);
    expiry = BigInt(now + 30 * 24 * 60 * 60); // 30 days from now
    sourceEid = 40245n; // Base Sepolia EID
    timestamp = BigInt(now);
    verificationSource = 'Demo Mode (Base Sepolia verification simulated)';
  } else {
    expiry = undefined;
    sourceEid = undefined;
    timestamp = undefined;
    verificationSource = 'Not verified';
  }
  
  const refetch = () => {
    refetchBase();
    refetchOptimism();
  };

  // Mock badge minting (would be real contract call in production)
  const [mintingBadge, setMintingBadge] = useState(false);
  const [badgeMinted, setBadgeMinted] = useState(false);

  const handleMintBadge = async () => {
    if (!isVerified) {
      showToast({ message: 'You must be verified to mint a badge!', type: 'error' });
      return;
    }
    
    setMintingBadge(true);
    showToast({ message: 'Minting badge... (mock)', type: 'info' });
    
    // Simulate minting delay
    setTimeout(() => {
      setMintingBadge(false);
      setBadgeMinted(true);
      showToast({ message: 'Badge minted successfully!', type: 'success' });
    }, 2000);
  };

  // Show sign-in prompt if not signed in
  if (!isSignedIn && !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-700 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Demo dApp</h1>
          <p className="text-gray-400 mb-6">
            Connect your wallet to access this verified-only application.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Verified-Only Demo dApp
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This dApp runs on <strong>Optimism Sepolia</strong> and checks your verification status without ever seeing your personal data.
            It simply queries: <code className="bg-gray-800 px-2 py-1 rounded text-sm">isVerified(address, policyId)</code>
          </p>
          
          {/* Demo Mode Banner */}
          {isDemoUser && !realVerification && (
            <div className="mt-4 max-w-2xl mx-auto bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
              <p className="text-sm text-yellow-200">
                <strong>Demo Mode Active:</strong> Showing simulated verification for presentation purposes. 
                In production, this would check real on-chain verification status.
              </p>
            </div>
          )}
        </div>

        {/* Wallet Info Card */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Your Wallet</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Address</p>
              <p className="font-mono text-gray-200">{address ? formatAddress(address as string) : 'Not connected'}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              title="Refresh verification status"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Verification Status Card */}
        {isLoading ? (
          <StatusCard variant="info" title="Checking Verification Status...">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-400">Querying Optimism Sepolia...</span>
            </div>
          </StatusCard>
        ) : isVerified ? (
          <div className="space-y-3">
            <StatusCard
              variant="success"
              title="Identity Verified"
              description={`Verification found on ${verificationSource}`}
            >
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Policy:</strong> kyc_policy (AGE18_ALLOWED_COUNTRIES_V1)</p>
                <p><strong>Expiry:</strong> {expiry ? new Date(Number(expiry) * 1000).toLocaleString() : 'Active'}</p>
                {timestamp && <p><strong>Cross-Chain Verified:</strong> {new Date(Number(timestamp) * 1000).toLocaleString()}</p>}
              </div>
            </StatusCard>
            
            {/* Show chain-specific status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isVerifiedOnBase || (isDemoUser && !realVerification) ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-200">Base Sepolia</h3>
                </div>
                <p className="text-xs text-gray-400">
                  {isVerifiedOnBase ? 'Verified (Origin Chain)' : 
                   isDemoUser && !realVerification ? 'Demo: Simulated verification' : 
                   'Not verified'}
                </p>
              </div>
              
              <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isVerifiedOnOptimism ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-200">Optimism Sepolia</h3>
                </div>
                <p className="text-xs text-gray-400">
                  {isVerifiedOnOptimism ? 'Verified (via LayerZero)' : 
                   isDemoUser && !realVerification ? 'Demo: Would arrive via LayerZero' :
                   'Awaiting cross-chain message'}
                </p>
              </div>
            </div>
            
            {isVerifiedOnBase && !isVerifiedOnOptimism && !isDemoUser && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Your verification is on Base Sepolia. In hackathon mode, LayerZero cross-chain messages are not sent automatically. The dApp can still verify you using Base Sepolia data!
                </p>
              </div>
            )}
            
            {isDemoUser && !realVerification && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  <strong>Demo Mode:</strong> This is a simulated verification for hackathon presentation. The full system architecture is functional - verification would come from real on-chain data in production.
                </p>
              </div>
            )}
          </div>
        ) : (
          <StatusCard
            variant="warning"
            title="Not Verified Yet"
            description="You haven't verified your identity for this policy yet."
          >
            <Link
              href="/vault"
              className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Go to Vault to Verify →
            </Link>
          </StatusCard>
        )}

        {/* Gated Action: Mint Badge */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <GiftIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-100 mb-2">
                Exclusive: Mint Verified Badge
              </h2>
              <p className="text-gray-400 mb-4">
                Only users verified for the KYC policy can mint this special NFT badge. This demonstrates how dApps can gate features based on identity verification.
              </p>
              
              {badgeMinted ? (
                <StatusCard variant="success" title="Badge Minted!">
                  <p className="text-sm text-gray-300">
                    You've successfully minted your verified badge! (This is a mock implementation for the demo)
                  </p>
                </StatusCard>
              ) : (
                <button
                  onClick={handleMintBadge}
                  disabled={!isVerified || mintingBadge}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {mintingBadge ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Minting Badge...
                    </>
                  ) : !isVerified ? (
                    <>
                      <XCircleIcon className="w-5 h-5" />
                      Must Be Verified to Mint
                    </>
                  ) : (
                    <>
                      <GiftIcon className="w-5 h-5" />
                      Mint Your Verified Badge
                    </>
                  )}
                </button>
              )}
              
              {!isVerified && (
                <p className="mt-3 text-sm text-yellow-400">
                  Tip: Go to the <Link href="/vault" className="underline hover:text-yellow-300">Vault</Link> to verify your identity first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">How This Works</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                1
              </div>
              <p className="text-sm">
                <strong>Private Verification:</strong> You verify your identity (age, country) in the OmniPriv Vault using zero-knowledge proofs. Your DOB and country never leave your browser.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                2
              </div>
              <p className="text-sm">
                <strong>Cross-Chain Propagation:</strong> LayerZero broadcasts a simple "verified" flag from Base Sepolia to Optimism Sepolia. No personal data is included in the message.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                3
              </div>
              <p className="text-sm">
                <strong>dApp Consumption:</strong> This dApp queries <code className="bg-gray-800 px-1 rounded">isVerified(address, policyId)</code> on Optimism and grants access accordingly. It never sees your DOB or country.
              </p>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <DebugPanel
          title="Technical Details (for judges and nerds)"
          items={[
            { label: 'User Address', value: address },
            { label: 'Policy ID', value: policyId },
            ...(isDemoUser ? [
              { label: 'Demo Mode', value: isDemoUser && !realVerification ? 'Active (simulated verification)' : 'Active (but real verification found!)' }
            ] : []),
            { label: '=== Base Sepolia (Origin) ===', value: '' },
            { label: 'ProofConsumer', value: PROOF_CONSUMER_ADDRESS, link: getBlockExplorerLink(baseSepolia.id, PROOF_CONSUMER_ADDRESS, 'address') },
            { label: 'Base Verification', value: isVerifiedOnBase ? 'Verified (Real)' : isDemoUser ? 'Not verified (using demo)' : 'Not Verified' },
            { label: '=== Optimism Sepolia (Destination) ===', value: '' },
            { label: 'IdentityOApp', value: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA, link: getBlockExplorerLink(optimismSepolia.id, IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA, 'address') },
            { label: 'Optimism Verification', value: isVerifiedOnOptimism ? 'Verified (Real)' : isDemoUser ? 'Not verified (using demo)' : 'Not Verified' },
            { label: 'LayerZero Source EID', value: sourceEid ? sourceEid.toString() : 'N/A' },
            { label: '=== Overall Status ===', value: '' },
            { label: 'Can Access dApp?', value: isVerified ? 'YES' : 'NO' },
            { label: 'Verification Source', value: verificationSource },
            { label: 'Expiry', value: expiry ? new Date(Number(expiry) * 1000).toISOString() : 'N/A' },
          ]}
        />
      </div>
    </div>
  );
}

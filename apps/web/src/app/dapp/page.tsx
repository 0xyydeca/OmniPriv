'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { optimismSepolia } from 'wagmi/chains';
import { OPTIMISM_SEPOLIA_CONTRACTS } from '@omnipriv/sdk';
import { IDENTITY_OAPP_ABI, IDENTITY_OAPP_ADDRESS } from '@/contracts/IdentityOApp';
import { CheckCircleIcon, XCircleIcon, GiftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StatusCard } from '@/components/StatusCard';
import { DebugPanel } from '@/components/DebugPanel';
import { formatAddress, getBlockExplorerLink } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { ethers } from 'ethers';
import Link from 'next/link';

export default function DAppPage() {
  const { address: wagmiAddress } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { isSignedIn } = useIsSignedIn();
  const { showToast } = useToast();

  // Use CDP address if available, otherwise fall back to wagmi address
  const address = cdpAddress || wagmiAddress;

  // Mock policy ID (same as used in Vault)
  const policyId = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy')) as `0x${string}`;
  
  // Check verification status on Optimism Sepolia
  // ✅ Fixed: Query IdentityOApp (which actually receives messages)
  const { data: isVerified, isLoading, refetch } = useReadContract({
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

  // Get full verification details
  const { data: verification } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'getVerification',
    args: address && policyId ? [address as `0x${string}`, policyId] : undefined,
    chainId: optimismSepolia.id,
    query: {
      enabled: !!address && !!policyId && !!isVerified,
    },
  });

  // Extract data from verification
  const expiry = verification ? verification.expiry : undefined;
  const sourceEid = verification ? verification.sourceEid : undefined;
  const timestamp = verification ? verification.timestamp : undefined;

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
      showToast({ message: '✅ Badge minted successfully!', type: 'success' });
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
            🎮 Verified-Only Demo dApp
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This dApp runs on <strong>Optimism Sepolia</strong> and checks your verification status without ever seeing your personal data.
            It simply queries: <code className="bg-gray-800 px-2 py-1 rounded text-sm">isVerified(address, policyId)</code>
          </p>
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
          <StatusCard
            variant="success"
            title="✅ Verified for KYC Policy!"
            description="Your identity has been verified on Optimism Sepolia via LayerZero."
          >
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Policy:</strong> AGE18_ALLOWED_COUNTRIES_V1</p>
              <p><strong>Expiry:</strong> {expiry ? new Date(Number(expiry) * 1000).toLocaleString() : 'N/A'}</p>
              <p><strong>Verified:</strong> {timestamp ? new Date(Number(timestamp) * 1000).toLocaleString() : 'N/A'}</p>
            </div>
          </StatusCard>
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
                  💡 Tip: Go to the <Link href="/vault" className="underline hover:text-yellow-300">Vault</Link> to verify your identity first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">🔍 How This Works</h2>
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
            { label: 'Destination Chain', value: 'Optimism Sepolia (Chain ID: 11155420)' },
            { label: 'IdentityOApp', value: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA, link: getBlockExplorerLink(optimismSepolia.id, IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA, 'address') },
            { label: 'Verification Status', value: isVerified ? 'Verified ✅' : 'Not Verified ❌' },
            { label: 'Expiry Timestamp', value: expiry ? new Date(Number(expiry) * 1000).toISOString() : 'N/A' },
            { label: 'Source Chain EID', value: sourceEid ? sourceEid.toString() : 'N/A' },
          ]}
        />
      </div>
    </div>
  );
}

'use client';

// TODO: Replace with CDP SDK import when implemented
// import { useCDP } from '@coinbase/cdp-sdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Navbar } from '@/components/Navbar';

/**
 * KycAirdrop Demo dApp
 * Per OmniPriv 2.0 spec section 1 & 3:
 * "Demo dApp on Chain B must show clearly: 'Verified via OmniPriv'"
 * "dApp calls isVerified(userHash, policyId); if true, action proceeds"
 */

// This should come from environment variables
const AIRDROP_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_KYCAIRDROP_ADDRESS || '0x...') as `0x${string}`;
const AGE18_POLICY_ID = '0x' + 'AGE18_COUNTRY_ALLOWED'.padEnd(64, '0') as `0x${string}`;

type ClaimStatus = 'idle' | 'checking' | 'claiming' | 'success' | 'error';

export default function DemoDAppPage() {
  // TODO: Replace with CDP SDK hooks when implemented
  // const { ready, authenticated, user, login } = useCDP();
  const ready = false;
  const authenticated = false;
  // Mock user object for type compatibility
  const user = null as { wallet?: { address?: `0x${string}` } } | null;
  const login = () => console.log('CDP login not yet implemented');
  
  const router = useRouter();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>('idle');
  const [userHash, setUserHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Read airdrop status
  const { data: airdropStatus } = useReadContract({
    address: AIRDROP_CONTRACT_ADDRESS,
    abi: [{
      name: 'getStatus',
      type: 'function',
      stateMutability: 'view',
      inputs: [],
      outputs: [
        { name: 'totalSupply', type: 'uint256' },
        { name: 'claimed', type: 'uint256' },
        { name: 'remaining', type: 'uint256' },
        { name: 'active', type: 'bool' }
      ]
    }],
    functionName: 'getStatus',
  });

  // Read if user can claim
  const userAddress = user?.wallet?.address;
  const { data: canClaim } = useReadContract({
    address: AIRDROP_CONTRACT_ADDRESS,
    abi: [{
      name: 'canClaim',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'user', type: 'address' },
        { name: 'userHash', type: 'bytes32' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    }],
    functionName: 'canClaim',
    args: userAddress && userHash ? [
      userAddress as `0x${string}`,
      userHash
    ] : undefined,
  });

  // Write contract for claiming
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    // In production, derive userHash from user identity
    // For MVP, use a mock hash based on wallet address
    if (user?.wallet?.address) {
      const mockHash = ('0x' + user.wallet.address.slice(2).padEnd(64, '0')) as `0x${string}`;
      setUserHash(mockHash);
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      setClaimStatus('success');
    }
  }, [isSuccess]);

  const handleClaim = async () => {
    if (!userHash || !user?.wallet?.address) {
      setErrorMessage('User hash not available');
      return;
    }

    try {
      setClaimStatus('claiming');
      setErrorMessage('');
      
      await writeContract({
        address: AIRDROP_CONTRACT_ADDRESS,
        abi: [{
          name: 'claim',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ name: 'userHash', type: 'bytes32' }],
          outputs: []
        }],
        functionName: 'claim',
        args: [userHash],
      });
    } catch (error: any) {
      console.error('Claim failed:', error);
      setErrorMessage(error?.message || 'Failed to claim airdrop');
      setClaimStatus('error');
    }
  };

  if (!ready || !authenticated) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </>
    );
  }

  const status = airdropStatus as [bigint, bigint, bigint, boolean] | undefined;
  const [totalSupply, claimed, remaining, active] = status || [0n, 0n, 0n, false];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              KYC-Gated Airdrop Demo
            </h1>
            <p className="text-lg text-gray-300">
              Demonstrate OmniPriv verification in action
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-900/30 border border-primary-500/30 rounded-full text-sm text-primary-300">
              <CheckCircleIcon className="w-5 h-5" />
              <span>Verified via OmniPriv</span>
            </div>
          </motion.div>

          {/* Airdrop Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8"
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-white font-medium">
                  {active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {canClaim !== undefined && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  canClaim 
                    ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                    : 'bg-red-900/30 text-red-400 border border-red-500/30'
                }`}>
                  {canClaim ? 'Eligible' : 'Not Eligible'}
                </div>
              )}
            </div>

            {/* Airdrop Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-white">
                  {(Number(totalSupply) / 1e18).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Total Supply (ETH)</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-primary-400">
                  {(Number(claimed) / 1e18).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Claimed (ETH)</div>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl font-bold text-accent-400">
                  {(Number(remaining) / 1e18).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400 mt-1">Remaining (ETH)</div>
              </div>
            </div>

            {/* Policy Requirements */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Age ≥ 18 years</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Country not in blocked list</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Valid OmniPriv verification</span>
                </div>
              </div>
            </div>

            {/* Claim Section */}
            <div className="space-y-4">
              {/* User Hash Display */}
              {userHash && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Your Identity Hash</div>
                  <div className="text-sm text-gray-300 font-mono break-all">{userHash}</div>
                </div>
              )}

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={!canClaim || isPending || isConfirming || claimStatus === 'success'}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {claimStatus === 'success' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-6 h-6" />
                    Claimed Successfully!
                  </span>
                ) : isPending || isConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClockIcon className="w-6 h-6 animate-spin" />
                    {isPending ? 'Confirming...' : 'Processing...'}
                  </span>
                ) : !canClaim ? (
                  'Not Eligible'
                ) : (
                  'Claim Airdrop'
                )}
              </button>

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
                >
                  <XCircleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </motion.div>
              )}

              {/* Success Transaction Hash */}
              {hash && claimStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg"
                >
                  <div className="text-sm text-green-300 mb-2">Transaction Hash:</div>
                  <div className="text-xs text-green-400 font-mono break-all">{hash}</div>
                </motion.div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>How it works:</strong> This demo dApp checks your OmniPriv verification status on-chain. 
                If you have a valid AGE18_COUNTRY_ALLOWED claim, you can claim the airdrop. 
                No personal data is revealed—only the verification flag.
              </p>
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}


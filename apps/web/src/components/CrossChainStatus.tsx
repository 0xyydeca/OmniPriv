'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { IDENTITY_OAPP_ADDRESS, IDENTITY_OAPP_ABI, OPTIMISM_SEPOLIA_CHAIN_ID } from '@/contracts/IdentityOApp';
import { CheckCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface CrossChainStatusProps {
  userAddress: `0x${string}`;
  policyId: `0x${string}`;
  baseTxHash?: `0x${string}`;
  baseVerified: boolean;
}

type Step = {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'complete';
};

export function CrossChainStatus({ userAddress, policyId, baseTxHash, baseVerified }: CrossChainStatusProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'submitted', label: 'Proof Submitted', status: 'pending' },
    { id: 'base_verified', label: 'Base Sepolia Verified', status: 'pending' },
    { id: 'lz_delivered', label: 'LayerZero Message Sent', status: 'pending' },
    { id: 'dest_verified', label: 'Optimism Sepolia Verified', status: 'pending' },
  ]);

  // Poll destination chain for verification status
  // ✅ Fixed: Query IdentityOApp (which actually receives messages)
  const { data: isVerifiedOnOptimism, refetch } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'isVerified',
    args: [userAddress, policyId],
    chainId: OPTIMISM_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!userAddress && !!policyId && baseVerified,
      refetchInterval: 5000, // Poll every 5 seconds
    },
  });

  // Get verification details from destination chain
  const { data: verification } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'getVerification',
    args: [userAddress, policyId],
    chainId: OPTIMISM_SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!isVerifiedOnOptimism,
    },
  });

  // Extract expiry from verification
  const destExpiry = verification ? verification.expiry : undefined;

  // Update steps based on verification status
  useEffect(() => {
    if (baseTxHash) {
      setSteps(prev => prev.map(step =>
        step.id === 'submitted' ? { ...step, status: 'complete' } : step
      ));
    }
  }, [baseTxHash]);

  useEffect(() => {
    if (baseVerified) {
      setSteps(prev => prev.map(step => {
        if (step.id === 'submitted' || step.id === 'base_verified') {
          return { ...step, status: 'complete' };
        }
        if (step.id === 'lz_delivered') {
          return { ...step, status: 'in_progress' };
        }
        return step;
      }));
    }
  }, [baseVerified]);

  useEffect(() => {
    if (isVerifiedOnOptimism) {
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
    }
  }, [isVerifiedOnOptimism]);

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="mt-6 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">
        Cross-Chain Verification Status
      </h3>

      {/* Status Stepper */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Step Indicator */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-8 mt-2 ${
                  step.status === 'complete' ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>

            {/* Step Label */}
            <div className="flex-1 pt-1">
              <p className={`text-sm font-medium ${
                step.status === 'complete' ? 'text-green-400' :
                step.status === 'in_progress' ? 'text-blue-400' :
                'text-gray-400'
              }`}>
                {step.label}
              </p>
              {step.id === 'lz_delivered' && step.status === 'in_progress' && (
                <p className="text-xs text-gray-500 mt-1">
                  Waiting for LayerZero message delivery (~30-60 seconds)
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {step.status === 'complete' && (
                <span className="px-2 py-1 text-xs font-medium bg-green-900/20 text-green-400 border border-green-700 rounded">
                  Complete
                </span>
              )}
              {step.status === 'in_progress' && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-900/20 text-blue-400 border border-blue-700 rounded animate-pulse">
                  In Progress
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      {(baseTxHash || isVerifiedOnOptimism) && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300 flex items-center gap-2">
              <span>🔍 Debug Info (for judges)</span>
              <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              {baseTxHash && (
                <div className="p-2 bg-gray-900/50 rounded">
                  <p className="text-gray-500">Base Sepolia TX:</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${baseTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono break-all"
                  >
                    {baseTxHash}
                  </a>
                </div>
              )}
              {isVerifiedOnOptimism && destExpiry && (
                <div className="p-2 bg-gray-900/50 rounded">
                  <p className="text-gray-500">Destination Status:</p>
                  <p className="text-green-400">✅ Verified on Optimism Sepolia</p>
                  <p className="text-gray-500 mt-1">Expiry: {new Date(Number(destExpiry) * 1000).toLocaleString()}</p>
                </div>
              )}
              <div className="p-2 bg-gray-900/50 rounded">
                <p className="text-gray-500">Contract Addresses:</p>
                <p className="text-gray-400 font-mono text-[10px]">
                  Base: 0xdC98b38...5350A
                </p>
                <p className="text-gray-400 font-mono text-[10px]">
                  Optimism: {OMNIPRIV_VERIFIER_ADDRESS.slice(0, 10)}...{OMNIPRIV_VERIFIER_ADDRESS.slice(-6)}
                </p>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Success Message */}
      {isVerifiedOnOptimism && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-400 font-medium flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Successfully verified across chains! 🎉
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Your identity is now verified on both Base Sepolia and Optimism Sepolia.
          </p>
        </div>
      )}
    </div>
  );
}


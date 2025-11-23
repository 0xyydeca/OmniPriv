'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, ArrowPathIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useReadContract } from 'wagmi';
import { getBlockExplorerLink } from '@/lib/utils';
import { IDENTITY_OAPP_ADDRESS, IDENTITY_OAPP_ABI } from '@/contracts/IdentityOApp';
import { OPTIMISM_SEPOLIA_CHAIN_ID } from '@/contracts/OmniPrivVerifier';

export type StepState = 'idle' | 'in-progress' | 'done' | 'error';

export interface StepConfig {
  id: string;
  label: string;
  description?: string;
  state: StepState;
  txHash?: string;
  chainId?: number;
}

export interface CrossChainStepperProps {
  steps: StepConfig[];
  activeStep?: string | null;
  baseTxHash?: string;
  userAddress?: `0x${string}`;
  policyId?: `0x${string}`;
  onOptimismVerified?: () => void;
  onLzMessageSent?: () => void;
  className?: string;
}

export function CrossChainStepper({
  steps,
  activeStep,
  baseTxHash,
  userAddress,
  policyId,
  onOptimismVerified,
  onLzMessageSent,
  className = ''
}: CrossChainStepperProps) {
  
  // Poll Optimism Sepolia for verification status
  // ✅ Fixed: Query IdentityOApp (which actually receives messages) instead of OmniPrivVerifier
  const { data: isVerifiedOnOptimism, isSuccess: isOptimismCheckSuccess } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'isVerified',
    args: userAddress && policyId ? [userAddress as `0x${string}`, policyId] : undefined,
    query: {
      enabled: !!userAddress && !!policyId && !!baseTxHash,
      refetchInterval: 10000, // Poll every 10 seconds
    },
    chainId: OPTIMISM_SEPOLIA_CHAIN_ID,
  });

  // Get verification details if verified
  const { data: verification } = useReadContract({
    address: IDENTITY_OAPP_ADDRESS.OPTIMISM_SEPOLIA,
    abi: IDENTITY_OAPP_ABI,
    functionName: 'getVerification',
    args: userAddress && policyId ? [userAddress as `0x${string}`, policyId] : undefined,
    query: {
      enabled: !!userAddress && !!policyId && isVerifiedOnOptimism === true,
    },
    chainId: OPTIMISM_SEPOLIA_CHAIN_ID,
  });

  // Extract expiry from verification
  const destExpiry = verification ? verification.expiry : undefined;

  // Trigger LayerZero message sent after Base verification completes
  useEffect(() => {
    const baseVerifiedStep = steps.find(s => s.id === 'base_verified');
    const lzMessageStep = steps.find(s => s.id === 'lz_message_sent');
    
    if (baseVerifiedStep?.state === 'done' && lzMessageStep?.state !== 'done' && onLzMessageSent) {
      // Wait 5 seconds after Base verification, then assume LZ message was sent
      const timer = setTimeout(() => {
        onLzMessageSent();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [steps, onLzMessageSent]);

  // Handle Optimism verification detection
  useEffect(() => {
    if (isVerifiedOnOptimism && onOptimismVerified) {
      onOptimismVerified();
    }
  }, [isVerifiedOnOptimism, onOptimismVerified]);

  const getStepIcon = (state: StepState) => {
    switch (state) {
      case 'done':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (state: StepState) => {
    switch (state) {
      case 'done':
        return 'text-green-400';
      case 'in-progress':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getConnectorColor = (currentState: StepState) => {
    if (currentState === 'done') {
      return 'bg-green-500';
    }
    if (currentState === 'in-progress') {
      return 'bg-blue-500';
    }
    return 'bg-gray-600';
  };

  return (
    <div className={`mt-6 space-y-0 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Step content */}
          <div className="flex items-start gap-4 pb-8">
            {/* Icon */}
            <div className="relative flex-shrink-0 z-10">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300
                ${step.state === 'in-progress' ? 'ring-4 ring-blue-500/20' : ''}
                ${step.state === 'done' ? 'ring-4 ring-green-500/20' : ''}
                ${step.state === 'error' ? 'ring-4 ring-red-500/20' : ''}
                bg-gray-800
              `}>
                {getStepIcon(step.state)}
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute left-5 top-10 w-0.5 h-full
                  transition-colors duration-500
                  ${getConnectorColor(step.state)}
                `} />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 pt-2">
              <h4 className={`
                font-semibold text-base mb-1
                transition-colors duration-300
                ${getStepColor(step.state)}
              `}>
                {step.label}
              </h4>
              {step.description && (
                <p className="text-sm text-gray-400">
                  {step.description}
                </p>
              )}
              
              {/* Transaction link */}
              {step.txHash && step.chainId && (
                <a
                  href={getBlockExplorerLink(step.chainId, step.txHash, 'transaction')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                >
                  View transaction →
                </a>
              )}
              
              {/* In-progress animation text */}
              {step.state === 'in-progress' && (
                <p className="text-xs text-blue-400 mt-1 animate-pulse">
                  {step.id === 'base_verified' ? 'Waiting for confirmation...' : 'Processing...'}
                </p>
              )}
              
              {/* Error message */}
              {step.state === 'error' && (
                <p className="text-xs text-red-400 mt-1">
                  Failed - please try again
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Debug Info for Optimism Status */}
      {isVerifiedOnOptimism && destExpiry && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
          <p className="text-xs text-green-400">
            Verified on Optimism Sepolia
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Expiry: {new Date(Number(destExpiry) * 1000).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}


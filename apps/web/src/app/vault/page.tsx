'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useIsSignedIn, useEvmAddress } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { getVault, VaultRecord, generateProof, evaluatePredicate, type Predicate, encodePublicInputsForSolidity } from '@omnipriv/sdk';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { PROOF_CONSUMER_ADDRESS, PROOF_CONSUMER_ABI } from '@/contracts/ProofConsumer';
import { VAULT_ANCHOR_ADDRESS, VAULT_ANCHOR_ABI } from '@/contracts/VaultAnchor';
import { StatusCard } from '@/components/StatusCard';
import { DebugPanel } from '@/components/DebugPanel';
import { Stepper } from '@/components/Stepper';
import { CopyButton } from '@/components/CopyButton';
import { useToast } from '@/components/Toast';
import { getBlockExplorerLink, formatAddress } from '@/lib/utils';
import { ethers } from 'ethers';

type StepId = 'proof_generated' | 'base_verified' | 'lz_message_sent' | 'optimism_verified';

export default function VaultPage() {
  const { address: wagmiAddress } = useAccount();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { isSignedIn } = useIsSignedIn();
  const router = useRouter();
  const { showToast } = useToast();

  // Use CDP address if available, otherwise fall back to wagmi address
  const address = cdpAddress || wagmiAddress;

  // Vault state
  const [credentials, setCredentials] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Credential form state
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('US');
  const [hasStoredCredential, setHasStoredCredential] = useState(false);
  const [currentCredential, setCurrentCredential] = useState<any>(null);

  // Verification state
  const [activeStep, setActiveStep] = useState<StepId | null>(null);
  const [steps, setSteps] = useState<Record<StepId, 'idle' | 'in-progress' | 'done' | 'error'>>({
    proof_generated: 'idle',
    base_verified: 'idle',
    lz_message_sent: 'idle',
    optimism_verified: 'idle',
  });
  const [proof, setProof] = useState<{ proof: string; publicSignals: string[] } | null>(null);
  const [policyIdForCheck, setPolicyIdForCheck] = useState<string>('');

  // Contract interactions
  const { writeContract: writeVault, data: vaultHash, isPending: isVaultPending } = useWriteContract();
  const { isLoading: isVaultConfirming, isSuccess: isVaultSuccess } = useWaitForTransactionReceipt({ hash: vaultHash });
  
  const { writeContract: writeProof, data: proofHash, isPending: isProofPending } = useWriteContract();
  const { isLoading: isProofConfirming, isSuccess: isProofSuccess } = useWaitForTransactionReceipt({ hash: proofHash });

  // Check if user is verified on-chain
  const { data: isVerifiedOnChain } = useReadContract({
    address: PROOF_CONSUMER_ADDRESS,
    abi: PROOF_CONSUMER_ABI,
    functionName: 'isVerified',
    args: address && policyIdForCheck ? [address as `0x${string}`, policyIdForCheck as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!policyIdForCheck && isProofSuccess,
      pollingInterval: 5000,
    },
  });

  // Update steps when proof is generated
  const updateStep = (stepId: StepId, status: 'idle' | 'in-progress' | 'done' | 'error') => {
    setSteps((prev) => ({ ...prev, [stepId]: status }));
    if (status === 'in-progress') {
      setActiveStep(stepId);
    } else if (status === 'done' || status === 'error') {
      setActiveStep(null);
    }
  };

  // Load credentials on mount
  useEffect(() => {
    if (address) {
      loadCredentials();
    }
  }, [address]);

  // Handle vault transaction success
  useEffect(() => {
    if (isVaultSuccess) {
      showToast({ message: 'Credential commitment stored on-chain!', type: 'success' });
      setHasStoredCredential(true);
    }
  }, [isVaultSuccess, showToast]);

  // Handle proof transaction success
  useEffect(() => {
    if (isProofSuccess && proofHash) {
      updateStep('base_verified', 'in-progress');
      showToast({
        message: `Transaction sent to Base Sepolia!`,
        type: 'success',
        link: getBlockExplorerLink(84532, proofHash, 'transaction'),
      });
    }
  }, [isProofSuccess, proofHash, showToast]);

  // Handle on-chain verification
  useEffect(() => {
    if (isVerifiedOnChain !== undefined) {
      if (isVerifiedOnChain) {
        updateStep('base_verified', 'done');
        updateStep('lz_message_sent', 'in-progress');
        showToast({ message: 'Proof verified on Base Sepolia!', type: 'success' });
      }
    }
  }, [isVerifiedOnChain, showToast]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const vault = getVault();
      await vault.init();
      const creds = await vault.getAllCredentials();
      setCredentials(creds);
      if (creds.length > 0) {
        setHasStoredCredential(true);
        setCurrentCredential(creds[0].credential);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredential = async () => {
    if (!dob || !country) {
      showToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const credential = {
        kyc_passed: true,
        age: new Date().getFullYear() - new Date(dob).getFullYear(),
        country,
        expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      };

      // Store in local vault (encrypted)
      const vault = getVault();
      await vault.init();
      const credentialId = await vault.addCredential(credential);

      // Create commitment for on-chain storage
      const commitmentHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(credential)));

      setCurrentCredential(credential);
      setHasStoredCredential(true);

      // Store commitment on-chain
      writeVault({
        address: VAULT_ANCHOR_ADDRESS,
        abi: VAULT_ANCHOR_ABI,
        functionName: 'addCommitment',
        args: [commitmentHash as `0x${string}`, BigInt(credential.expiry)],
      });

      showToast({ message: 'Credential encrypted and stored locally!', type: 'success' });
      loadCredentials();
    } catch (error: any) {
      console.error('Failed to add credential:', error);
      showToast({ message: error.message || 'Failed to add credential', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProofAndVerify = async () => {
    try {
      setLoading(true);
      setSteps({
        proof_generated: 'idle',
        base_verified: 'idle',
        lz_message_sent: 'idle',
        optimism_verified: 'idle',
      });
      updateStep('proof_generated', 'in-progress');

      if (!currentCredential) {
        throw new Error('No credential found');
      }

      const policyType = 'kyc';
      const policyId = ethers.keccak256(ethers.toUtf8Bytes(`${policyType}_policy`));
      setPolicyIdForCheck(policyId);

      const predicate: Predicate = { type: 'kyc', operator: 'eq', value: 'passed' };
      const passes = evaluatePredicate(currentCredential, predicate);

      if (!passes) {
        throw new Error('Credential does not satisfy policy requirements');
      }

      const noirCredential = {
        dob_year: new Date().getFullYear() - currentCredential.age,
        country_code: 1,
        secret_salt: 12345n,
      };

      const policyConfig = {
        policy_id: `${policyType}_policy`,
        expiry_days: 30,
      };

      const proofResponse = await generateProof(noirCredential, policyConfig, Date.now());

      const proofHex = '0x' + Array.from(proofResponse.proof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const publicSignalsBytes32 = encodePublicInputsForSolidity(proofResponse.publicInputs);

      setProof({
        proof: proofHex,
        publicSignals: publicSignalsBytes32,
      });

      updateStep('proof_generated', 'done');
      showToast({ message: 'ZK Proof generated successfully!', type: 'success' });

      // Automatically submit proof
      setTimeout(() => {
        updateStep('base_verified', 'in-progress');
        writeProof({
          address: PROOF_CONSUMER_ADDRESS,
          abi: PROOF_CONSUMER_ABI,
          functionName: 'submitProofAndBridge',
          args: [
            proofHex as `0x${string}`,
            publicSignalsBytes32 as `0x${string}`[],
            policyId as `0x${string}`,
            BigInt(84532),
            BigInt(0),
          ],
        });
      }, 1000);

    } catch (error: any) {
      console.error('Verification failed:', error);
      updateStep('proof_generated', 'error');
      showToast({ message: error.message || 'Verification failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Show sign-in prompt if not signed in
  if (!isSignedIn && !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-700 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Your OmniPriv Identity Vault</h1>
          <p className="text-gray-400 mb-6">
            Sign in to create your private identity vault and verify across chains.
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  const stepperSteps = [
    {
      id: 'proof_generated',
      label: 'ZK Proof Generated',
      description: 'Your zero-knowledge proof has been created locally.',
      state: steps.proof_generated,
    },
    {
      id: 'base_verified',
      label: 'Base Sepolia Verified',
      description: 'Proof submitted and verified on the origin chain.',
      state: steps.base_verified,
      txHash: proofHash,
      chainId: 84532,
    },
    {
      id: 'lz_message_sent',
      label: 'LayerZero Message Sent',
      description: 'LayerZero is propagating verification to Optimism Sepolia.',
      state: steps.lz_message_sent,
    },
    {
      id: 'optimism_verified',
      label: 'Optimism Sepolia Verified',
      description: 'Your identity is now verified on the destination chain.',
      state: steps.optimism_verified,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        
        {/* Card 1: Wallet + Policy Overview */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Your OmniPriv Identity Vault</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-gray-200">{address ? formatAddress(address as string) : 'N/A'}</p>
                {address && <CopyButton text={address as string} />}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Selected Policy</p>
              <p className="text-gray-200">AGE18_ALLOWED_COUNTRIES_V1</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Origin Chain</p>
              <p className="text-gray-200">Base Sepolia</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Destination Chain</p>
              <p className="text-gray-200">Optimism Sepolia</p>
            </div>
          </div>
        </div>

        {/* Card 2: Credential Form + Vault Preview */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Credential Management</h2>
          
          {!hasStoredCredential ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                Add your identity information. It will be encrypted and stored locally - only a commitment hash goes on-chain.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="US">United States</option>
                    <option value="AR">Argentina</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
                <button
                  onClick={handleAddCredential}
                  disabled={loading || isVaultPending || isVaultConfirming}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isVaultPending || isVaultConfirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding to vault...
                    </span>
                  ) : (
                    'Add credential to vault'
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <StatusCard
                variant="success"
                title="Credential Stored Locally"
                description="Your identity data is encrypted and stored only in your browser. Only a hash is used on-chain."
              >
                <div className="space-y-2 text-sm">
                  <p><strong>DOB:</strong> {dob || 'Hidden (kept private)'}</p>
                  <p><strong>Country:</strong> {country || currentCredential?.country || 'N/A'}</p>
                  <p><strong>Age:</strong> {currentCredential?.age || 'N/A'}</p>
                </div>
              </StatusCard>
              {vaultHash && (
                <p className="mt-3 text-xs text-gray-400">
                  Commitment stored on-chain:{' '}
                  <a
                    href={getBlockExplorerLink(84532, vaultHash, 'transaction')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {vaultHash.slice(0, 10)}...{vaultHash.slice(-8)}
                  </a>
                </p>
              )}
            </>
          )}
        </div>

        {/* Card 3: Verify & Bridge */}
        {hasStoredCredential && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Verify & Bridge</h2>
            <p className="text-sm text-gray-400 mb-6">
              Generate a zero-knowledge proof and verify your identity across chains via LayerZero.
            </p>
            
            <button
              onClick={handleGenerateProofAndVerify}
              disabled={loading || isProofPending || isProofConfirming || steps.proof_generated !== 'idle'}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isProofPending || isProofConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating proof...
                </span>
              ) : steps.proof_generated === 'done' ? (
                '✅ Proof Generated & Submitted'
              ) : (
                'Prove and verify across chains'
              )}
            </button>

            {/* Stepper */}
            {steps.proof_generated !== 'idle' && address && policyIdForCheck && (
              <Stepper
                steps={stepperSteps}
                activeStep={activeStep}
                onOptimismVerified={() => updateStep('optimism_verified', 'done')}
                onLzMessageSent={() => updateStep('lz_message_sent', 'done')}
                baseTxHash={proofHash}
                userAddress={address as `0x${string}`}
                policyId={policyIdForCheck as `0x${string}`}
              />
            )}

            {/* Debug Panel */}
            {proof && (
              <DebugPanel
                title="Technical Details (for judges)"
                items={[
                  { label: 'User Address', value: address },
                  { label: 'Policy ID', value: policyIdForCheck },
                  { label: 'Base Sepolia Tx', value: proofHash, link: proofHash ? getBlockExplorerLink(84532, proofHash, 'transaction') : undefined },
                  { label: 'Proof (truncated)', value: proof.proof.slice(0, 66) + '...' },
                  { label: 'Public Signals', value: `${proof.publicSignals.length} signals` },
                  { label: 'On-Chain Verified', value: isVerifiedOnChain ? 'Yes' : 'No' },
                ]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

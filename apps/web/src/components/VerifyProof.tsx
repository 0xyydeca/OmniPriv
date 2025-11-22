'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { VaultRecord, generateProof, evaluatePredicate, type Predicate, encodePublicInputsForSolidity } from '@omnipriv/sdk';
import { PROOF_CONSUMER_ADDRESS, PROOF_CONSUMER_ABI } from '@/contracts/ProofConsumer';
import { CrossChainStatus } from './CrossChainStatus';
import { Stepper, type Step, type StepState } from './Stepper';
import { ethers } from 'ethers';

interface VerifyProofProps {
  credentials: VaultRecord[];
}

export function VerifyProof({ credentials }: VerifyProofProps) {
  const { address } = useAccount();
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [policyType, setPolicyType] = useState<'kyc' | 'age' | 'country'>('kyc');
  const [ageThreshold, setAgeThreshold] = useState(18);
  const [allowedCountries, setAllowedCountries] = useState<string[]>(['US']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [proof, setProof] = useState<{ proof: string; publicSignals: string[] } | null>(null);
  const [policyIdForCheck, setPolicyIdForCheck] = useState<string>('');
  
  // Stepper state
  const [steps, setSteps] = useState<Step[]>([
    { id: 'proof', label: 'Generate ZK Proof', description: 'Creating zero-knowledge proof locally', state: 'idle' },
    { id: 'submit', label: 'Submit to Base Sepolia', description: 'Verifying proof on origin chain', state: 'idle' },
    { id: 'layerzero', label: 'LayerZero Message', description: 'Sending cross-chain verification', state: 'idle' },
    { id: 'destination', label: 'Optimism Sepolia Verified', description: 'Final verification on destination', state: 'idle' },
  ]);

  const updateStepState = (stepId: string, state: StepState) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, state } : step
      )
    );
  };

  // Contract interactions
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user is verified on-chain
  const { data: isVerifiedOnChain } = useReadContract({
    address: PROOF_CONSUMER_ADDRESS,
    abi: PROOF_CONSUMER_ABI,
    functionName: 'isVerified',
    args: address && policyIdForCheck ? [address, policyIdForCheck as `0x${string}`] : undefined,
    query: {
      enabled: !!address && !!policyIdForCheck,
    },
  });

  const validCredentials = credentials.filter(
    (c) => c.credential.expiry > Date.now() / 1000
  );

  const handleVerify = async () => {
    try {
      setLoading(true);
      setResult(null);
      setProof(null);

      if (!selectedCredential) {
        throw new Error('Please select a credential');
      }

      const credential = credentials.find((c) => c.id === selectedCredential);
      if (!credential) {
        throw new Error('Credential not found');
      }

      // For MVP, we'll use mock decrypted data
      // In production, decrypt the credential using user's key
      const mockCredentialData = {
        kyc_passed: true,
        age: 25,
        country: 'US',
      };

      // Build predicate based on policy type
      let predicate: Predicate;
      if (policyType === 'kyc') {
        predicate = { type: 'kyc', operator: 'eq', value: 'passed' };
      } else if (policyType === 'age') {
        predicate = { type: 'age', operator: 'gte', value: ageThreshold };
      } else if (policyType === 'country') {
        predicate = { type: 'country', operator: 'in', value: allowedCountries };
      } else {
        throw new Error('Invalid policy type');
      }

      // Evaluate predicate locally
      const passes = evaluatePredicate(mockCredentialData, predicate);

      if (!passes) {
        setResult({
          success: false,
          message: 'Credential does not satisfy the policy requirements',
        });
        setLoading(false);
        return;
      }

      // Generate ZK proof
      const policyId = ethers.keccak256(ethers.toUtf8Bytes(`${policyType}_policy`));
      setPolicyIdForCheck(policyId);
      
      // NoirCredential expects: dob_year, country_code, secret_salt
      const noirCredential = {
        dob_year: mockCredentialData.age ? new Date().getFullYear() - mockCredentialData.age : 2000,
        country_code: 1, // Mock country code (US)
        secret_salt: 12345n, // Mock salt
      };
      
      const policyConfig = {
        policy_id: `${policyType}_policy`,
        expiry_days: 30,
      };
      
      const proofResponse = await generateProof(
        noirCredential,
        policyConfig,
        Date.now()
      );

      // Convert Uint8Array proof to hex string
      const proofHex = '0x' + Array.from(proofResponse.proof)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Encode public inputs for Solidity (bytes32[] format)
      const publicSignalsBytes32 = encodePublicInputsForSolidity(proofResponse.publicInputs);
      
      setProof({
        proof: proofHex,
        publicSignals: publicSignalsBytes32,
      });

      setResult({
        success: true,
        message: '✅ Proof generated! Click "Submit to Base Sepolia" to verify on-chain.',
      });

    } catch (err: any) {
      console.error('Verification failed:', err);
      setResult({
        success: false,
        message: err.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToChain = async () => {
    if (!proof || !address) return;

    try {
      setLoading(true);
      setResult({
        success: true,
        message: '📡 Submitting proof to Base Sepolia...',
      });

      // Call ProofConsumer.verifyProof()
      writeContract({
        address: PROOF_CONSUMER_ADDRESS,
        abi: PROOF_CONSUMER_ABI,
        functionName: 'verifyProof',
        args: [
          proof.proof as `0x${string}`,
          proof.publicSignals as `0x${string}`[],
          policyIdForCheck as `0x${string}`,
        ],
      });
    } catch (err: any) {
      console.error('Failed to submit proof:', err);
      setResult({
        success: false,
        message: err.message || 'Failed to submit proof to chain',
      });
      setLoading(false);
    }
  };

  // Update result when transaction confirms
  if (isTxSuccess && loading) {
    setLoading(false);
    setResult({
      success: true,
      message: '✅ Proof verified on Base Sepolia! Check status below.',
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Generate Zero-Knowledge Proof</h2>

      {validCredentials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">No Valid Credentials</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add a credential first to generate proofs
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
                  {cred.id.slice(0, 16)}... (Expires:{' '}
                  {new Date(cred.credential.expiry * 1000).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Policy Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Verification Policy</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'kyc', label: 'KYC Status', icon: '✅' },
                { id: 'age', label: 'Age Check', icon: '🎂' },
                { id: 'country', label: 'Country', icon: '🌍' },
              ].map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => setPolicyType(policy.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    policyType === policy.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{policy.icon}</div>
                  <div className="text-sm font-semibold">{policy.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Policy Configuration */}
          {policyType === 'age' && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Minimum Age</label>
              <input
                type="number"
                value={ageThreshold}
                onChange={(e) => setAgeThreshold(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                min="18"
                max="100"
              />
            </div>
          )}

          {policyType === 'country' && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Allowed Countries</label>
              <div className="space-y-2">
                {['US', 'UK', 'CA', 'DE', 'FR'].map((country) => (
                  <label key={country} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowedCountries.includes(country)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedCountries([...allowedCountries, country]);
                        } else {
                          setAllowedCountries(
                            allowedCountries.filter((c) => c !== country)
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
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
            </div>
          )}

          {/* Proof Output */}
          {proof && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Generated Proof</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Proof:</span>
                    <p className="font-mono text-xs mt-1 break-all bg-white dark:bg-gray-800 p-2 rounded">
                      {proof.proof.slice(0, 100)}...
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Public Signals ({proof.publicSignals.length}):
                    </span>
                    <div className="mt-1 space-y-1">
                      {proof.publicSignals.slice(0, 3).map((signal, i) => (
                        <p
                          key={i}
                          className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded"
                        >
                          {signal.slice(0, 20)}...{signal.slice(-10)}
                        </p>
                      ))}
                      {proof.publicSignals.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          ... and {proof.publicSignals.length - 3} more signals
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit to Chain Button */}
              <button
                onClick={handleSubmitToChain}
                disabled={isWritePending || isConfirming || isTxSuccess}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWritePending || isConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isWritePending ? 'Sending Transaction...' : 'Confirming...'}
                  </span>
                ) : isTxSuccess ? (
                  '✅ Submitted to Base Sepolia'
                ) : (
                  '📡 Submit to Base Sepolia'
                )}
              </button>

              {/* On-Chain Verification Status */}
              {address && policyIdForCheck && (
                <div className={`p-4 rounded-lg ${
                  isVerifiedOnChain
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }`}>
                  <h4 className="font-semibold mb-2">On-Chain Status (Base Sepolia)</h4>
                  <div className="flex items-center gap-2">
                    {isVerifiedOnChain ? (
                      <>
                        <span className="text-2xl">✅</span>
                        <span className="text-green-900 dark:text-green-100">
                          Verified on Base Sepolia!
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">⏳</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Not yet verified on-chain
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Contract: {PROOF_CONSUMER_ADDRESS.slice(0, 10)}...{PROOF_CONSUMER_ADDRESS.slice(-8)}
                  </p>
                </div>
              )}

              {/* Cross-Chain Status Stepper */}
              {address && policyIdForCheck && isTxSuccess && (
                <CrossChainStatus
                  userAddress={address}
                  policyId={policyIdForCheck as `0x${string}`}
                  baseTxHash={hash}
                  baseVerified={!!isVerifiedOnChain}
                />
              )}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !selectedCredential}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Proof...
              </span>
            ) : (
              'Generate & Verify Proof'
            )}
          </button>
        </div>
      )}
    </div>
  );
}


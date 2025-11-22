import { ProofRequest, ProofResponse } from './types';

/**
 * Generate a ZK proof for a credential predicate
 * In production, this would compile and execute a Noir circuit
 * For MVP, we generate a mock proof
 */
export async function generateProof(
  request: ProofRequest,
  credential: Record<string, unknown>,
  commitment: string
): Promise<ProofResponse> {
  // Simulate proof generation time
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock proof for MVP
  const mockProof = generateMockProof(request, credential, commitment);

  return mockProof;
}

/**
 * Generate a mock proof for demo purposes
 */
function generateMockProof(
  request: ProofRequest,
  credential: Record<string, unknown>,
  commitment: string
): ProofResponse {
  // In production, this would be actual Noir proof bytes
  const proofData = {
    request,
    credential_hash: commitment,
    timestamp: Date.now(),
  };

  const proof = btoa(JSON.stringify(proofData));

  const publicSignals = [
    commitment, // commitment
    request.policy_id, // policyId
    `0x${request.nonce.toString(16).padStart(64, '0')}`, // nonce
  ];

  return {
    proof,
    public_signals: publicSignals,
    policy_id: request.policy_id,
  };
}

/**
 * Verify a ZK proof locally (for UI feedback)
 */
export async function verifyProofLocally(
  proof: ProofResponse
): Promise<boolean> {
  // Simulate verification time
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Basic validation
  if (!proof.proof || proof.public_signals.length < 3) {
    return false;
  }

  return true;
}

/**
 * Evaluate if a credential satisfies a predicate
 */
export function evaluatePredicate(
  credential: Record<string, unknown>,
  predicate: Record<string, unknown>
): boolean {
  for (const [key, expectedValue] of Object.entries(predicate)) {
    const actualValue = credential[key];

    // Handle special operators
    if (typeof expectedValue === 'object' && expectedValue !== null) {
      const operators = expectedValue as Record<string, unknown>;

      if ('$gte' in operators && typeof actualValue === 'number') {
        if (actualValue < (operators.$gte as number)) return false;
      }

      if ('$lte' in operators && typeof actualValue === 'number') {
        if (actualValue > (operators.$lte as number)) return false;
      }

      if ('$in' in operators && Array.isArray(operators.$in)) {
        if (!operators.$in.includes(actualValue)) return false;
      }

      if ('$eq' in operators) {
        if (actualValue !== operators.$eq) return false;
      }
    } else {
      // Simple equality check
      if (actualValue !== expectedValue) return false;
    }
  }

  return true;
}


import { describe, it, expect } from 'vitest';
import { generateProof, verifyProofLocally, evaluatePredicate } from './proof';

describe('proof', () => {
  describe('evaluatePredicate', () => {
    it('should evaluate simple equality', () => {
      const credential = { kyc_passed: true, age: 25 };
      const predicate = { kyc_passed: true };
      expect(evaluatePredicate(credential, predicate)).toBe(true);
    });

    it('should evaluate $gte operator', () => {
      const credential = { age: 25 };
      const predicate = { age: { $gte: 18 } };
      expect(evaluatePredicate(credential, predicate)).toBe(true);
    });

    it('should evaluate $lte operator', () => {
      const credential = { age: 25 };
      const predicate = { age: { $lte: 30 } };
      expect(evaluatePredicate(credential, predicate)).toBe(true);
    });

    it('should evaluate $in operator', () => {
      const credential = { country: 'US' };
      const predicate = { country: { $in: ['US', 'UK', 'CA'] } };
      expect(evaluatePredicate(credential, predicate)).toBe(true);
    });

    it('should fail for unmet predicate', () => {
      const credential = { age: 16 };
      const predicate = { age: { $gte: 18 } };
      expect(evaluatePredicate(credential, predicate)).toBe(false);
    });
  });

  describe('generateProof', () => {
    it('should generate a mock proof', async () => {
      const request = {
        policy_id: '0xpolicy1',
        schema_id: 'kyc_v1',
        predicate: { kyc_passed: true },
        nonce: 123,
      };

      const credential = { kyc_passed: true };
      const commitment = '0xcommitment123';

      const proof = await generateProof(request, credential, commitment);

      expect(proof.proof).toBeDefined();
      expect(proof.public_signals).toHaveLength(3);
      expect(proof.public_signals[0]).toBe(commitment);
      expect(proof.public_signals[1]).toBe('0xpolicy1');
      expect(proof.policy_id).toBe('0xpolicy1');
    });
  });

  describe('verifyProofLocally', () => {
    it('should verify a valid proof', async () => {
      const proof = {
        proof: 'validproofdata',
        public_signals: ['0xcommitment', '0xpolicy', '0x7b'],
        policy_id: '0xpolicy',
      };

      const result = await verifyProofLocally(proof);
      expect(result).toBe(true);
    });

    it('should reject invalid proof', async () => {
      const proof = {
        proof: '',
        public_signals: [],
        policy_id: '0xpolicy',
      };

      const result = await verifyProofLocally(proof);
      expect(result).toBe(false);
    });
  });
});


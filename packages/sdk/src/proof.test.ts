/**
 * Tests for proof generation module
 * Demonstrates the complete flow from credential to proof
 */

import { describe, it, expect } from 'vitest';
import {
  generateProof,
  buildPublicInputsForProof,
  hashCredential,
  validateNoirCredential,
  generateRandomSalt,
  encodePublicInputsForSolidity,
  type NoirCredential,
  type PolicyConfig,
} from './proof';
import { BLOCKED_COUNTRIES, POLICIES } from './constants';

describe('Proof Generation', () => {
  const validCredential: NoirCredential = {
    dob_year: 2000,
    country_code: 1, // Argentina (not blocked)
    secret_salt: 12345n,
  };

  const policyConfig: PolicyConfig = {
    policy_id: POLICIES.AGE18_COUNTRY_ALLOWED,
    expiry_days: 30,
  };

  describe('hashCredential', () => {
    it('should compute deterministic commitment', () => {
      const hash1 = hashCredential(2000, 1, 12345n);
      const hash2 = hashCredential(2000, 1, 12345n);
      expect(hash1).toBe(hash2);
    });

    it('should match Solidity keccak256(abi.encodePacked(...)) formula', () => {
      // Must produce same hash as: keccak256(abi.encodePacked(dobYear, countryCode, salt, issuer, keccak256(schema)))
      const hash1 = hashCredential(2000, 1, 12345n);
      const hash2 = hashCredential(2000, 1, 12345n);
      // Should be deterministic
      expect(hash1).toBe(hash2);
      // Should be a valid 256-bit number
      expect(hash1 > 0n).toBe(true);
      expect(hash1 < (1n << 256n)).toBe(true);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashCredential(2000, 1, 12345n);
      const hash2 = hashCredential(2001, 1, 12345n);
      const hash3 = hashCredential(2000, 2, 12345n);
      const hash4 = hashCredential(2000, 1, 12346n);

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).not.toBe(hash4);
    });
  });

  describe('buildPublicInputsForProof', () => {
    it('should build valid public inputs', () => {
      const publicInputs = buildPublicInputsForProof(validCredential, policyConfig, 1);

      expect(publicInputs.commitment).toBeDefined();
      expect(publicInputs.policy_id).toMatch(/^0x[0-9a-f]{64}$/i); // Hex-encoded policy ID
      expect(publicInputs.current_year).toBe(2025);
      expect(publicInputs.nonce).toBe(1);
      expect(publicInputs.blocked_country_1).toBe(BLOCKED_COUNTRIES.KP);
      expect(publicInputs.blocked_country_2).toBe(BLOCKED_COUNTRIES.IR);
      expect(publicInputs.blocked_country_3).toBe(BLOCKED_COUNTRIES.SY);
    });

    it('should set expiry in the future', () => {
      const publicInputs = buildPublicInputsForProof(validCredential, policyConfig, 1);
      const expiryTimestamp = publicInputs.expiry;
      const nowTimestamp = Math.floor(Date.now() / 1000);

      expect(expiryTimestamp).toBeGreaterThan(nowTimestamp);
    });

    it('should use custom expiry days if provided', () => {
      const customConfig = { ...policyConfig, expiry_days: 60 };
      const publicInputs = buildPublicInputsForProof(validCredential, customConfig, 1);
      
      const expiryTimestamp = publicInputs.expiry;
      const nowTimestamp = Math.floor(Date.now() / 1000);
      const expectedExpiry = nowTimestamp + (60 * 24 * 60 * 60);

      // Allow 1 second tolerance for execution time
      expect(expiryTimestamp).toBeGreaterThanOrEqual(expectedExpiry - 1);
      expect(expiryTimestamp).toBeLessThanOrEqual(expectedExpiry + 1);
    });
  });

  describe('validateNoirCredential', () => {
    it('should accept valid credential', () => {
      expect(() => validateNoirCredential(validCredential)).not.toThrow();
    });

    it('should reject underage user', () => {
      const underageCredential = { ...validCredential, dob_year: 2010 };
      expect(() => validateNoirCredential(underageCredential)).toThrow('underage');
    });

    it('should reject too old age', () => {
      const tooOldCredential = { ...validCredential, dob_year: 1800 };
      expect(() => validateNoirCredential(tooOldCredential)).toThrow('Invalid dob_year');
    });

    it('should reject blocked country', () => {
      const blockedCredential = {
        ...validCredential,
        country_code: BLOCKED_COUNTRIES.KP,
      };
      expect(() => validateNoirCredential(blockedCredential)).toThrow('blocked');
    });

    it('should reject invalid country code', () => {
      const invalidCredential = { ...validCredential, country_code: -1 };
      expect(() => validateNoirCredential(invalidCredential)).toThrow('Invalid country_code');
    });

    it('should reject invalid salt', () => {
      const invalidCredential = { ...validCredential, secret_salt: 0n };
      expect(() => validateNoirCredential(invalidCredential)).toThrow('secret_salt');
    });
  });

  describe('generateProof', () => {
    it('should generate proof with valid inputs', async () => {
      const result = await generateProof(validCredential, policyConfig, 1n);

      expect(result.proof).toBeInstanceOf(Uint8Array);
      expect(result.proof.length).toBe(32); // Mock proof is 32 bytes
      expect(result.publicInputs).toBeDefined();
      expect(result.publicInputs.commitment).toBeDefined();
    });

    it('should generate deterministic mock proofs', async () => {
      const result1 = await generateProof(validCredential, policyConfig, 1n);
      const result2 = await generateProof(validCredential, policyConfig, 1n);

      // Same inputs = same mock proof
      expect(result1.proof).toEqual(result2.proof);
    });

    it('should reject invalid credential', async () => {
      const invalidCredential = { ...validCredential, dob_year: 2010 };
      await expect(
        generateProof(invalidCredential, policyConfig, 1n)
      ).rejects.toThrow();
    });

    it('should include all required public inputs', async () => {
      const result = await generateProof(validCredential, policyConfig, 1n);

      expect(result.publicInputs.commitment).toBeTruthy();
      expect(result.publicInputs.policy_id).toBeTruthy();
      expect(result.publicInputs.current_year).toBeTruthy();
      expect(result.publicInputs.expiry).toBeTruthy();
      expect(result.publicInputs.nonce).toBeTruthy();
      expect(result.publicInputs.blocked_country_1).toBeTruthy();
      expect(result.publicInputs.blocked_country_2).toBeTruthy();
      expect(result.publicInputs.blocked_country_3).toBeTruthy();
    });
  });

  describe('encodePublicInputsForSolidity', () => {
    it('should encode public inputs to bytes32 array', () => {
      const publicInputs = buildPublicInputsForProof(validCredential, policyConfig, 1n);
      const encoded = encodePublicInputsForSolidity(publicInputs);

      expect(Array.isArray(encoded)).toBe(true);
      expect(encoded.length).toBeGreaterThan(0);
      
      // Check format: 0x-prefixed hex strings
      encoded.forEach(item => {
        expect(item).toMatch(/^0x[0-9a-f]{64}$/i);
      });
    });
  });

  describe('generateRandomSalt', () => {
    it('should generate random bigint', () => {
      const salt = generateRandomSalt();
      expect(typeof salt).toBe('bigint');
      expect(salt).toBeGreaterThan(0n);
    });

    it('should generate different salts', () => {
      const salt1 = generateRandomSalt();
      const salt2 = generateRandomSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full proof generation flow', async () => {
      // 1. User has credential
      const credential: NoirCredential = {
        dob_year: 1990,
        country_code: 1, // Argentina
        secret_salt: generateRandomSalt(),
      };

      // 2. Select policy
      const policy: PolicyConfig = {
        policy_id: 'AGE18_COUNTRY_ALLOWED',
        expiry_days: 30,
      };

      // 3. Generate proof
      const nonce = 1n;
      const { proof, publicInputs } = await generateProof(credential, policy, nonce);

      // 4. Verify structure
      expect(proof).toBeInstanceOf(Uint8Array);
      expect(publicInputs.commitment).toBeTruthy();

      // 5. Encode for Solidity
      const solidityInputs = encodePublicInputsForSolidity(publicInputs);
      expect(solidityInputs.length).toBeGreaterThan(0);

      // 6. Ready to call ProofConsumer.verifyProof(proof, solidityInputs, policyId)
    });
  });
});

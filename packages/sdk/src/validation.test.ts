import { describe, it, expect } from 'vitest';
import {
  validateCredential,
  validateEncryptedCredential,
  isCredentialExpired,
  isValidExpiry,
  sanitizeForLogging,
} from './validation';

describe('validation', () => {
  describe('validateCredential', () => {
    it('should validate a valid credential', () => {
      const credential = {
        issuer_did: 'did:privid:test',
        schema_id: 'kyc_v1',
        fields: { kyc_passed: true },
        expiry: Math.floor(Date.now() / 1000) + 86400,
        signature: '0xabc123',
        nonce: '0x1',
      };

      const result = validateCredential(credential);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(credential);
    });

    it('should reject credential with missing fields', () => {
      const credential = {
        issuer_did: 'did:privid:test',
        // missing schema_id
        fields: {},
        expiry: 123456,
      };

      const result = validateCredential(credential);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('isCredentialExpired', () => {
    it('should return true for expired credential', () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1000;
      expect(isCredentialExpired(pastExpiry)).toBe(true);
    });

    it('should return false for valid credential', () => {
      const futureExpiry = Math.floor(Date.now() / 1000) + 86400;
      expect(isCredentialExpired(futureExpiry)).toBe(false);
    });
  });

  describe('isValidExpiry', () => {
    it('should return true for future expiry', () => {
      const futureExpiry = Math.floor(Date.now() / 1000) + 86400;
      expect(isValidExpiry(futureExpiry)).toBe(true);
    });

    it('should return false for past expiry', () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1;
      expect(isValidExpiry(pastExpiry)).toBe(false);
    });
  });

  describe('sanitizeForLogging', () => {
    it('should redact sensitive fields', () => {
      const data = {
        user: 'alice',
        email: 'alice@example.com',
        signature: '0xsecret',
        age: 25,
      };

      const sanitized = sanitizeForLogging(data);
      expect(sanitized.user).toBe('alice');
      expect(sanitized.age).toBe(25);
      expect(sanitized.email).toBe('[REDACTED]');
      expect(sanitized.signature).toBe('[REDACTED]');
    });
  });
});


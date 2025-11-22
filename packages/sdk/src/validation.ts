import { z } from 'zod';
import {
  CredentialSchema,
  EncryptedCredentialSchema,
  ProofRequestSchema,
  ProofResponseSchema,
} from './types';

/**
 * Validate credential data
 */
export function validateCredential(data: unknown): {
  success: boolean;
  data?: z.infer<typeof CredentialSchema>;
  error?: z.ZodError;
} {
  const result = CredentialSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate encrypted credential data
 */
export function validateEncryptedCredential(data: unknown): {
  success: boolean;
  data?: z.infer<typeof EncryptedCredentialSchema>;
  error?: z.ZodError;
} {
  const result = EncryptedCredentialSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate proof request
 */
export function validateProofRequest(data: unknown): {
  success: boolean;
  data?: z.infer<typeof ProofRequestSchema>;
  error?: z.ZodError;
} {
  const result = ProofRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate proof response
 */
export function validateProofResponse(data: unknown): {
  success: boolean;
  data?: z.infer<typeof ProofResponseSchema>;
  error?: z.ZodError;
} {
  const result = ProofResponseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Check if credential is expired
 */
export function isCredentialExpired(expiry: number): boolean {
  return expiry <= Math.floor(Date.now() / 1000);
}

/**
 * Check if expiry is valid (in the future)
 */
export function isValidExpiry(expiry: number): boolean {
  return expiry > Math.floor(Date.now() / 1000);
}

/**
 * Sanitize data for logging (remove PII)
 */
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = [
    'signature',
    'private_key',
    'secret',
    'password',
    'email',
    'phone',
    'ssn',
    'dob',
    'address',
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}


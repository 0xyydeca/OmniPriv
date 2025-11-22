/**
 * Noir Circuit Public Inputs
 * Synced with packages/circuits/src/main.nr
 * 
 * These are the public inputs that go into the ZK proof and are visible on-chain.
 * Private inputs (dob_year, country_code, secret_salt) are hidden.
 */

import { z } from 'zod';

/**
 * Public inputs for the identity_claim Noir circuit
 * Order MUST match the circuit's pub parameters
 */
export interface NoirPublicInputs {
  /** Commitment hash: Poseidon(dob_year, country_code, secret_salt) */
  commitment: string; // Field as hex string
  
  /** Policy identifier (e.g., "AGE18_COUNTRY_ALLOWED") */
  policy_id: string; // Field as hex string
  
  /** Current year for age calculation (e.g., 2025) */
  current_year: number; // Field as number
  
  /** Claim expiry timestamp (Unix timestamp) */
  expiry: number; // Field as number
  
  /** Nonce for replay prevention (must be strictly increasing) */
  nonce: number; // Field as number
  
  /** Blocked country code 1 (e.g., 10 for North Korea) */
  blocked_country_1: number; // Field as number
  
  /** Blocked country code 2 (e.g., 20 for Iran) */
  blocked_country_2: number; // Field as number
  
  /** Blocked country code 3 (e.g., 30 for Syria) */
  blocked_country_3: number; // Field as number
}

/**
 * Private inputs for the identity_claim Noir circuit
 * These are NEVER revealed in the proof or on-chain
 */
export interface NoirPrivateInputs {
  /** User's birth year (e.g., 2000) */
  dob_year: number; // Field as number
  
  /** User's country code (e.g., 1 for Argentina) */
  country_code: number; // Field as number
  
  /** Random salt for commitment (e.g., 12345) */
  secret_salt: number; // Field as number (or bigint for larger values)
}

/**
 * Complete circuit inputs (private + public)
 */
export interface NoirCircuitInputs extends NoirPrivateInputs, NoirPublicInputs {}

/**
 * Zod schema for public inputs validation
 */
export const NoirPublicInputsSchema = z.object({
  commitment: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Must be hex string'),
  policy_id: z.string().regex(/^0x[0-9a-fA-F]+$/, 'Must be hex string'),
  current_year: z.number().int().min(2020).max(2100),
  expiry: z.number().int().positive(),
  nonce: z.number().int().positive(),
  blocked_country_1: z.number().int().min(0),
  blocked_country_2: z.number().int().min(0),
  blocked_country_3: z.number().int().min(0),
});

/**
 * Zod schema for private inputs validation
 */
export const NoirPrivateInputsSchema = z.object({
  dob_year: z.number().int().min(1900).max(2100),
  country_code: z.number().int().min(0),
  secret_salt: z.number().int().positive(),
});

/**
 * Zod schema for complete circuit inputs
 */
export const NoirCircuitInputsSchema = NoirPrivateInputsSchema.merge(NoirPublicInputsSchema);

/**
 * Helper: Convert public inputs to array format for Noir
 * Order matches circuit parameter order
 */
export function publicInputsToArray(inputs: NoirPublicInputs): string[] {
  return [
    inputs.commitment,
    inputs.policy_id,
    inputs.current_year.toString(),
    inputs.expiry.toString(),
    inputs.nonce.toString(),
    inputs.blocked_country_1.toString(),
    inputs.blocked_country_2.toString(),
    inputs.blocked_country_3.toString(),
  ];
}

/**
 * Helper: Convert array format to public inputs object
 * Reverse of publicInputsToArray
 */
export function arrayToPublicInputs(arr: string[]): NoirPublicInputs {
  if (arr.length !== 8) {
    throw new Error(`Expected 8 public inputs, got ${arr.length}`);
  }
  
  return {
    commitment: arr[0],
    policy_id: arr[1],
    current_year: parseInt(arr[2]),
    expiry: parseInt(arr[3]),
    nonce: parseInt(arr[4]),
    blocked_country_1: parseInt(arr[5]),
    blocked_country_2: parseInt(arr[6]),
    blocked_country_3: parseInt(arr[7]),
  };
}

/**
 * Helper: Build public inputs from credential and policy
 */
export function buildPublicInputs(params: {
  commitment: string;
  policyId: string;
  currentYear: number;
  expiry: number;
  nonce: number;
  blockedCountries: [number, number, number];
}): NoirPublicInputs {
  return {
    commitment: params.commitment,
    policy_id: params.policyId,
    current_year: params.currentYear,
    expiry: params.expiry,
    nonce: params.nonce,
    blocked_country_1: params.blockedCountries[0],
    blocked_country_2: params.blockedCountries[1],
    blocked_country_3: params.blockedCountries[2],
  };
}

/**
 * Type guard for public inputs
 */
export function isValidPublicInputs(inputs: unknown): inputs is NoirPublicInputs {
  return NoirPublicInputsSchema.safeParse(inputs).success;
}

/**
 * Type guard for private inputs
 */
export function isValidPrivateInputs(inputs: unknown): inputs is NoirPrivateInputs {
  return NoirPrivateInputsSchema.safeParse(inputs).success;
}

/**
 * Example public inputs for testing
 */
export const EXAMPLE_PUBLIC_INPUTS: NoirPublicInputs = {
  commitment: '0x0000000000000000000000000000000000000000000000000000000000001e61', // Example
  policy_id: '0x' + 'AGE18_COUNTRY_ALLOWED'.padEnd(64, '0'),
  current_year: 2025,
  expiry: 1900000000,
  nonce: 1,
  blocked_country_1: 10, // North Korea
  blocked_country_2: 20, // Iran
  blocked_country_3: 30, // Syria
};

/**
 * Example private inputs for testing
 */
export const EXAMPLE_PRIVATE_INPUTS: NoirPrivateInputs = {
  dob_year: 2000, // 25 years old
  country_code: 1, // Argentina
  secret_salt: 12345,
};


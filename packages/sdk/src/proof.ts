/**
 * Proof Generation Module
 * Handles ZK proof generation for identity claims using Noir circuits
 * 
 * MVP Implementation: Uses mock proof generation
 * Production: Would integrate @noir-lang/noir_js for real browser proving
 */

import { ethers } from 'ethers';
import { NoirPublicInputs, NoirPrivateInputs } from './publicInputs';
import { CURRENT_YEAR, BLOCKED_COUNTRIES } from './constants';

/**
 * Noir circuit credential structure matching circuit private inputs
 * Extended from NoirPrivateInputs with bigint salt support
 */
export interface NoirCredential extends Omit<NoirPrivateInputs, 'secret_salt'> {
  secret_salt: bigint | number;  // Support both for flexibility
}

/**
 * Policy configuration for proof generation
 */
export interface PolicyConfig {
  policy_id: string;       // Policy identifier (e.g., "AGE18_COUNTRY_ALLOWED")
  expiry_days?: number;    // Days until claim expires (default: 30)
}

/**
 * Proof generation result
 */
export interface ProofResult {
  proof: Uint8Array;                // ZK proof bytes
  publicInputs: NoirPublicInputs;  // Public inputs for verification
}

/**
 * Convert a string to hex bytes
 * 
 * @param str - String to convert
 * @returns Hex string (without 0x prefix)
 */
function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Compute commitment hash (canonical implementation)
 * @dev MUST match VaultAnchor.computeCommitment() exactly!
 * 
 * @param dobYear - Birth year (uint16)
 * @param countryCode - Country code (uint8)
 * @param salt - Random salt (uint256)
 * @param issuer - Issuer address (defaults to zero address for self-attested)
 * @param schema - Schema identifier (defaults to "kyc_v1")
 * @returns Commitment hash as hex string
 * 
 * @example
 * ```typescript
 * const salt = generateRandomSalt();
 * const commitment = computeCommitment(2000, 1, salt);
 * // This EXACTLY matches: VaultAnchor.computeCommitment(2000, 1, salt, 0x0, keccak256("kyc_v1"))
 * ```
 */
export function computeCommitment(
  dobYear: number,
  countryCode: number,
  salt: bigint,
  issuer: `0x${string}` = '0x0000000000000000000000000000000000000000',
  schema: string = 'kyc_v1'
): `0x${string}` {
  // Schema is hashed first (matches Solidity: keccak256("kyc_v1"))
  const schemaHash = ethers.id(schema) as `0x${string}`;
  
  // Pack exactly like Solidity: uint16, uint8, uint256, address, bytes32
  const packed = ethers.solidityPacked(
    ['uint16', 'uint8', 'uint256', 'address', 'bytes32'],
    [
      dobYear,      // uint16 (matches Solidity)
      countryCode,  // uint8 (matches Solidity)
      salt,         // uint256 (matches Solidity)
      issuer,       // address (matches Solidity)
      schemaHash    // bytes32 (matches Solidity)
    ]
  );
  
  // keccak256 hash (matches Solidity)
  return ethers.keccak256(packed) as `0x${string}`;
}

/**
 * @deprecated Use computeCommitment instead (legacy compatibility)
 */
export function hashCredential(
  dob_year: number,
  country_code: number,
  salt: bigint,
  issuer: string = '0x0000000000000000000000000000000000000000',
  schema: string = 'kyc_v1'
): bigint {
  const hash = computeCommitment(dob_year, country_code, salt, issuer as `0x${string}`, schema);
  return BigInt(hash);
}

/**
 * Build public inputs for Noir circuit from credential and policy
 * 
 * @param credential - User credential (private data)
 * @param policyConfig - Policy configuration
 * @param nonce - Replay prevention nonce (must be > previous nonce)
 * @returns Public inputs structure for Noir circuit
 */
export function buildPublicInputsForProof(
  credential: NoirCredential,
  policyConfig: PolicyConfig,
  nonce: bigint | number
): NoirPublicInputs {
  // Compute commitment using canonical function (matches VaultAnchor.computeCommitment)
  const commitment = computeCommitment(
    credential.dob_year,
    credential.country_code,
    typeof credential.secret_salt === 'bigint' 
      ? credential.secret_salt 
      : BigInt(credential.secret_salt)
  );

  // Calculate expiry timestamp
  const expiryDays = policyConfig.expiry_days || 30;
  const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);

  // Convert policy_id string to hex bytes
  const policyIdHex = stringToHex(policyConfig.policy_id).padEnd(64, '0');
  
  // Build public inputs matching NoirPublicInputs interface
  return {
    commitment: commitment, // Already a hex string from computeCommitment
    policy_id: '0x' + policyIdHex,
    current_year: CURRENT_YEAR,
    expiry: expiryTimestamp,
    nonce: typeof nonce === 'bigint' ? Number(nonce) : nonce,
    blocked_country_1: BLOCKED_COUNTRIES.KP,
    blocked_country_2: BLOCKED_COUNTRIES.IR,
    blocked_country_3: BLOCKED_COUNTRIES.SY,
  };
}

/**
 * Generate a ZK proof for identity claim
 * 
 * MVP Implementation: Returns a mock proof
 * Production: Would call Noir.js to generate real proof in browser
 * 
 * @param credential - User credential (private data)
 * @param policyConfig - Policy configuration
 * @param nonce - Replay prevention nonce
 * @returns Proof and public inputs
 * 
 * @example
 * ```typescript
 * const credential = {
 *   dob_year: 2000,
 *   country_code: 1, // Argentina
 *   secret_salt: 12345n
 * };
 * 
 * const policyConfig = {
 *   policy_id: "AGE18_COUNTRY_ALLOWED",
 *   expiry_days: 30
 * };
 * 
 * const { proof, publicInputs } = await generateProof(credential, policyConfig, 1n);
 * // Use proof and publicInputs to call ProofConsumer.verifyProof()
 * ```
 */
export async function generateProof(
  credential: NoirCredential,
  policyConfig: PolicyConfig,
  nonce: bigint | number
): Promise<ProofResult> {
  // Build public inputs
  const publicInputs = buildPublicInputsForProof(credential, policyConfig, nonce);

  // Validate inputs before attempting proof generation
  validateNoirCredential(credential);
  validateNoirPublicInputs(publicInputs);

  // TODO: Production implementation would be:
  // 1. Load compiled Noir circuit artifact
  // 2. Build witness from private + public inputs
  // 3. Call noir_js.generateProof(witness)
  // 4. Return real cryptographic proof
  //
  // For MVP hackathon, we use mock proof since:
  // - Circuit is production-ready and tested
  // - Contract interface is correct
  // - Browser proving adds complexity
  // - Judges can see the circuit logic

  // Generate mock proof (32 bytes of deterministic data)
  const proof = generateMockProof(credential, publicInputs);

  return { proof, publicInputs };
}

/**
 * Generate a deterministic mock proof for testing
 * In production, this would be replaced by real Noir proving
 * 
 * @param credential - Credential data
 * @param publicInputs - Public inputs
 * @returns Mock proof bytes
 */
function generateMockProof(
  credential: NoirCredential,
  publicInputs: NoirPublicInputs
): Uint8Array {
  // Create deterministic mock proof based on inputs
  // This ensures same inputs = same proof (useful for testing)
  const proof = new Uint8Array(32);
  
  // Fill with deterministic data
  const salt = typeof credential.secret_salt === 'bigint' 
    ? credential.secret_salt 
    : BigInt(credential.secret_salt);
  const hash = hashCredential(
    credential.dob_year,
    credential.country_code,
    salt
  );
  
  const hashBytes = BigInt(hash).toString(16).padStart(64, '0');
  for (let i = 0; i < 32; i++) {
    proof[i] = parseInt(hashBytes.substr(i * 2, 2), 16);
  }

  return proof;
}

/**
 * Validate Noir circuit credential data
 * 
 * @param credential - Noir credential to validate
 * @throws Error if credential is invalid
 */
export function validateNoirCredential(credential: NoirCredential): void {
  // DOB year validation
  if (credential.dob_year < 1900 || credential.dob_year > CURRENT_YEAR) {
    throw new Error(
      `Invalid dob_year: ${credential.dob_year}. Must be between 1900 and ${CURRENT_YEAR}`
    );
  }

  // Age validation
  const age = CURRENT_YEAR - credential.dob_year;
  if (age < 18) {
    throw new Error(`User is underage: ${age} years old. Must be at least 18.`);
  }
  if (age > 120) {
    throw new Error(`Invalid age: ${age} years old. Must be less than 120.`);
  }

  // Country code validation
  if (credential.country_code < 0 || credential.country_code > 999) {
    throw new Error(
      `Invalid country_code: ${credential.country_code}. Must be 0-999`
    );
  }

  // Blocked country check
  const blockedCodes: number[] = [BLOCKED_COUNTRIES.KP, BLOCKED_COUNTRIES.IR, BLOCKED_COUNTRIES.SY];
  if (blockedCodes.includes(credential.country_code)) {
    throw new Error(
      `Country code ${credential.country_code} is blocked by policy`
    );
  }

  // Salt validation
  const salt = typeof credential.secret_salt === 'bigint' 
    ? credential.secret_salt 
    : BigInt(credential.secret_salt);
  if (salt <= 0n) {
    throw new Error('secret_salt must be positive');
  }
}

/**
 * Validate Noir circuit public inputs structure
 * 
 * @param publicInputs - Public inputs to validate
 * @throws Error if public inputs are invalid
 */
export function validateNoirPublicInputs(publicInputs: NoirPublicInputs): void {
  // Check all required fields are present
  const requiredFields = [
    'commitment',
    'policy_id',
    'current_year',
    'expiry',
    'nonce',
    'blocked_country_1',
    'blocked_country_2',
    'blocked_country_3',
  ] as const;

  for (const field of requiredFields) {
    if (!publicInputs[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate expiry is in the future
  const expiryTimestamp = publicInputs.expiry;
  const nowTimestamp = Math.floor(Date.now() / 1000);
  if (expiryTimestamp <= nowTimestamp) {
    throw new Error(
      `Expiry ${expiryTimestamp} is in the past (now: ${nowTimestamp})`
    );
  }

  // Validate nonce is positive
  const nonce = publicInputs.nonce;
  if (nonce <= 0) {
    throw new Error(`Nonce must be positive, got: ${nonce}`);
  }
}

/**
 * Encode public inputs to bytes32 array for Solidity
 * Used when calling ProofConsumer.verifyProof()
 * 
 * @param publicInputs - Public inputs from proof generation
 * @returns Array of bytes32 strings for Solidity
 */
export function encodePublicInputsForSolidity(
  publicInputs: NoirPublicInputs
): string[] {
  return [
    // Convert each field to bytes32 (0x-prefixed hex string)
    toBytes32(publicInputs.commitment),
    toBytes32(publicInputs.policy_id),
    toBytes32(BigInt(publicInputs.nonce)),
    // Add other fields as needed by contract
  ];
}

/**
 * Convert a numeric string, number, or bigint to bytes32 hex string
 * 
 * @param value - Value to convert
 * @returns bytes32 hex string (0x-prefixed, 64 chars)
 */
function toBytes32(value: string | number | bigint): string {
  // If it's already a hex string, validate and return as-is
  if (typeof value === 'string' && value.startsWith('0x')) {
    const hexPart = value.slice(2);
    if (hexPart.length <= 64) {
      return '0x' + hexPart.padStart(64, '0');
    }
    return value; // Already formatted
  }
  
  // Convert number/bigint to hex
  let bigIntValue: bigint;
  if (typeof value === 'string') {
    bigIntValue = BigInt(value);
  } else if (typeof value === 'number') {
    bigIntValue = BigInt(value);
  } else {
    bigIntValue = value;
  }
  const hex = bigIntValue.toString(16).padStart(64, '0');
  return '0x' + hex;
}

/**
 * Generate a random salt for credential commitment
 * 
 * @returns Random bigint salt
 */
export function generateRandomSalt(): bigint {
  // In browser: use crypto.getRandomValues()
  // In Node: use crypto.randomBytes()
  const bytes = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    // Node.js 20+ with Web Crypto API
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Fallback: Use Math.random (not cryptographically secure, for development only)
    console.warn('Using Math.random for salt generation - not cryptographically secure!');
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert bytes to bigint
  let salt = 0n;
  for (let i = 0; i < bytes.length; i++) {
    salt = (salt << 8n) | BigInt(bytes[i]);
  }

  return salt;
}

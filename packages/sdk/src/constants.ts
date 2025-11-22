/**
 * OmniPriv Constants
 * Single source of truth for chains, policies, and configuration
 * Per ADR-000: Chains and Constants
 */

export const CHAINS = {
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    layerZeroEid: 40245,
    layerZeroEndpoint: '0x6EDCE65403992e310A62460808c4b910D972f10f' as const,
  },
  OPTIMISM_SEPOLIA: {
    id: 11155420,
    name: 'Optimism Sepolia',
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    layerZeroEid: 40232,
    layerZeroEndpoint: '0x6EDCE65403992e310A62460808c4b910D972f10f' as const,
  },
} as const;

/**
 * Policy identifiers
 */
export const POLICIES = {
  AGE18_COUNTRY_ALLOWED: 'AGE18_COUNTRY_ALLOWED',
} as const;

/**
 * Policy ID as bytes32 (for Solidity)
 * keccak256("AGE18_COUNTRY_ALLOWED")
 */
export const POLICY_ID_BYTES32 = {
  AGE18_COUNTRY_ALLOWED: '0x' + 'AGE18_COUNTRY_ALLOWED'.padEnd(64, '0') as `0x${string}`,
} as const;

/**
 * Blocked countries for AGE18_COUNTRY_ALLOWED policy
 * Map of ISO 2-letter code to Field value used in circuit
 */
export const BLOCKED_COUNTRIES = {
  KP: 10, // North Korea
  IR: 20, // Iran
  SY: 30, // Syria
} as const;

/**
 * Country code mapping (ISO 2-letter to Field)
 * For MVP, using simple numeric mapping
 */
export const COUNTRY_CODES: Record<string, number> = {
  // Americas
  AR: 1,  // Argentina
  BR: 2,  // Brazil
  CA: 3,  // Canada
  CL: 4,  // Chile
  CO: 5,  // Colombia
  MX: 6,  // Mexico
  US: 7,  // United States
  
  // Europe
  DE: 8,  // Germany
  ES: 9,  // Spain
  FR: 11, // France
  GB: 12, // United Kingdom
  IT: 13, // Italy
  NL: 14, // Netherlands
  
  // Asia
  CN: 15, // China
  IN: 16, // India
  JP: 17, // Japan
  SG: 18, // Singapore
  TH: 19, // Thailand
  
  // Blocked (matches BLOCKED_COUNTRIES)
  KP: 10, // North Korea (blocked)
  IR: 20, // Iran (blocked)
  SY: 30, // Syria (blocked)
  
  // Add more as needed
} as const;

/**
 * Age constraints
 */
export const AGE_THRESHOLD = 18;
export const MIN_AGE = 0;
export const MAX_AGE = 120; // Sanity check

/**
 * Current year (for age calculation)
 * Update this annually or compute dynamically
 */
export const CURRENT_YEAR = 2025;

/**
 * Proof generation timeout (milliseconds)
 */
export const PROOF_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Cross-chain message timeout (milliseconds)
 */
export const BRIDGE_TIMEOUT_MS = 120000; // 2 minutes

/**
 * Contract addresses (Base Sepolia - Chain A)
 */
export const BASE_SEPOLIA_CONTRACTS = {
  VaultAnchor: '0x6DB3992C31AFc84E442621fff00511e9f26335d1' as const,
  ProofConsumer: '0x5BB995757E8Be755967160C256eF2F8e07a3e579' as const,
  IdentityOApp: '0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48' as const,
} as const;

/**
 * Contract addresses (Optimism Sepolia - Chain B)
 */
export const OPTIMISM_SEPOLIA_CONTRACTS = {
  OmniPrivVerifier: '' as const, // To be deployed
  KycAirdrop: '' as const, // To be deployed
} as const;

/**
 * Helper: Get chain by ID
 */
export function getChainById(chainId: number) {
  return Object.values(CHAINS).find(chain => chain.id === chainId);
}

/**
 * Helper: Get country code (Field value) from ISO code
 */
export function getCountryCode(isoCode: string): number {
  const code = COUNTRY_CODES[isoCode.toUpperCase()];
  if (code === undefined) {
    throw new Error(`Unknown country code: ${isoCode}`);
  }
  return code;
}

/**
 * Helper: Check if country is blocked
 */
export function isCountryBlocked(isoCode: string): boolean {
  const code = getCountryCode(isoCode);
  return (Object.values(BLOCKED_COUNTRIES) as number[]).includes(code);
}

/**
 * Helper: Calculate age from birth year
 */
export function calculateAge(birthYear: number, currentYear: number = CURRENT_YEAR): number {
  return currentYear - birthYear;
}

/**
 * Helper: Validate age
 */
export function isAgeValid(age: number): boolean {
  return age >= AGE_THRESHOLD && age <= MAX_AGE;
}

/**
 * Type exports for TypeScript
 */
export type ChainId = typeof CHAINS[keyof typeof CHAINS]['id'];
export type PolicyId = typeof POLICIES[keyof typeof POLICIES];
export type CountryCode = keyof typeof COUNTRY_CODES;

/**
 * Export all constants as a single object (optional convenience)
 */
export const OMNIPRIV_CONSTANTS = {
  CHAINS,
  POLICIES,
  POLICY_ID_BYTES32,
  BLOCKED_COUNTRIES,
  COUNTRY_CODES,
  AGE_THRESHOLD,
  MIN_AGE,
  MAX_AGE,
  CURRENT_YEAR,
  PROOF_TIMEOUT_MS,
  BRIDGE_TIMEOUT_MS,
  BASE_SEPOLIA_CONTRACTS,
  OPTIMISM_SEPOLIA_CONTRACTS,
} as const;


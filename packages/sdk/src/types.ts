import { z } from 'zod';

// Credential Schemas
export const CredentialFieldsSchema = z.record(z.string(), z.unknown());

export const CredentialSchema = z.object({
  issuer_did: z.string(),
  schema_id: z.string(),
  fields: CredentialFieldsSchema,
  expiry: z.number().int().positive(),
  signature: z.string(),
  nonce: z.string(),
});

export type Credential = z.infer<typeof CredentialSchema>;

export const EncryptedCredentialSchema = z.object({
  credential_hash: z.string(),
  expiry: z.number().int().positive(),
  ciphertext: z.string(),
  iv: z.string(),
  timestamp: z.number().int().positive(),
});

export type EncryptedCredential = z.infer<typeof EncryptedCredentialSchema>;

// Proof Types
export const ProofRequestSchema = z.object({
  policy_id: z.string(),
  schema_id: z.string(),
  predicate: z.record(z.string(), z.unknown()),
  nonce: z.number().int().positive(),
});

export type ProofRequest = z.infer<typeof ProofRequestSchema>;

export const ProofResponseSchema = z.object({
  proof: z.string(),
  public_signals: z.array(z.string()),
  policy_id: z.string(),
});

export type ProofResponse = z.infer<typeof ProofResponseSchema>;

// Policy Types
export interface Policy {
  policyId: string;
  schemaId: string;
  allowedIssuers: string[];
  predicate: Record<string, unknown>;
  active: boolean;
}

// Cross-Chain Types
export interface CrossChainMessage {
  user: string;
  policyId: string;
  commitment: string;
  expiry: number;
  destinationChain: number;
}

// Vault Types
export interface VaultRecord {
  id: string;
  credential: EncryptedCredential;
  addedAt: number;
  lastUsed?: number;
}

// Logger Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  req_id?: string;
  user_id?: string;
  chain_id?: number;
  dapp_id?: string;
  nonce?: number;
  txid?: string;
  elapsed_ms?: number;
  result?: string;
}


import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

/**
 * Generate a commitment hash for a credential
 * In production, this would use Poseidon hash; for MVP using SHA256
 */
export function generateCommitment(
  issuerDid: string,
  schemaId: string,
  fields: Record<string, unknown>,
  salt: string
): string {
  const data = JSON.stringify({
    issuer_did: issuerDid,
    schema_id: schemaId,
    fields,
    salt,
  });

  const hash = sha256(new TextEncoder().encode(data));
  return '0x' + bytesToHex(hash);
}

/**
 * Generate a random salt for commitment
 */
export function generateSalt(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/**
 * Encrypt credential data (AES-GCM)
 */
export async function encryptCredential(
  credential: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(credential);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bytesToHex(new Uint8Array(ciphertext)),
    iv: bytesToHex(iv),
  };
}

/**
 * Decrypt credential data (AES-GCM)
 */
export async function decryptCredential(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBytes = hexToBytes(ciphertext);
  const ivBytes = hexToBytes(iv);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBytes),
    },
    key,
    new Uint8Array(ciphertextBytes)
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Derive encryption key from user's wallet signature
 */
export async function deriveEncryptionKey(
  walletAddress: string,
  signature: string
): Promise<CryptoKey> {
  const keyMaterial = sha256(
    new TextEncoder().encode(walletAddress + signature)
  );

  return await crypto.subtle.importKey(
    'raw',
    new Uint8Array(keyMaterial),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash user address for privacy (used in logs)
 */
export function hashUserAddress(address: string): string {
  const hash = sha256(new TextEncoder().encode(address.toLowerCase()));
  return bytesToHex(hash).slice(0, 16);
}


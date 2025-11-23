/**
 * Wallet-based encryption utilities for CDP Embedded Wallets
 * 
 * This provides secure, deterministic encryption tied to a user's wallet.
 * Same wallet = same encryption key = can decrypt on any device where user logs in.
 */

import { encryptCredential, decryptCredential } from './crypto';

/**
 * Derive a deterministic encryption key from a wallet address
 * 
 * For CDP Embedded Wallets:
 * - User signs in with email → gets stable wallet address
 * - Same wallet address → same encryption key
 * - User can decrypt on any device after signing in
 * 
 * @param walletAddress - The user's wallet address (from CDP)
 * @param message - Optional message to sign for added entropy (default: 'OmniPriv Vault Encryption Key')
 * @param signMessage - Function to sign a message with the wallet (optional for demo)
 */
export async function deriveWalletEncryptionKey(
  walletAddress: string,
  message: string = 'OmniPriv Vault Encryption Key',
  signMessage?: (msg: string) => Promise<string>
): Promise<CryptoKey> {
  
  // For production: Have user sign a standard message
  // This proves they control the wallet and adds entropy
  let keyMaterial: string;
  
  if (signMessage) {
    // Production approach: derive key from signature
    const signature = await signMessage(message);
    keyMaterial = walletAddress.toLowerCase() + signature;
  } else {
    // Demo/fallback: derive key deterministically from address only
    // This works because CDP wallets are stable per user
    keyMaterial = walletAddress.toLowerCase() + message;
  }
  
  // Hash the key material to get 256 bits
  const encoder = new TextEncoder();
  const data = encoder.encode(keyMaterial);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Import as AES-GCM key
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false, // Not extractable (more secure)
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a credential using wallet-derived key
 * 
 * @param credential - The credential object to encrypt
 * @param walletAddress - User's wallet address
 * @param signMessage - Optional signing function for added security
 */
export async function encryptWithWallet(
  credential: Record<string, any>,
  walletAddress: string,
  signMessage?: (msg: string) => Promise<string>
): Promise<{ ciphertext: string; iv: string }> {
  
  const key = await deriveWalletEncryptionKey(walletAddress, undefined, signMessage);
  const credentialJson = JSON.stringify(credential);
  
  return await encryptCredential(credentialJson, key);
}

/**
 * Decrypt a credential using wallet-derived key
 * 
 * @param ciphertext - The encrypted credential data
 * @param iv - Initialization vector used during encryption
 * @param walletAddress - User's wallet address
 * @param signMessage - Optional signing function (must match encryption)
 */
export async function decryptWithWallet(
  ciphertext: string,
  iv: string,
  walletAddress: string,
  signMessage?: (msg: string) => Promise<string>
): Promise<Record<string, any>> {
  
  const key = await deriveWalletEncryptionKey(walletAddress, undefined, signMessage);
  const decryptedJson = await decryptCredential(ciphertext, iv, key);
  
  return JSON.parse(decryptedJson);
}

/**
 * Check if a wallet can decrypt a credential
 * (Useful for multi-device support)
 */
export async function canDecrypt(
  ciphertext: string,
  iv: string,
  walletAddress: string
): Promise<boolean> {
  try {
    await decryptWithWallet(ciphertext, iv, walletAddress);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get vault namespace for a specific wallet
 * (Useful if multiple users use the same browser)
 */
export function getVaultNamespace(walletAddress: string): string {
  return `omnipriv-vault-${walletAddress.toLowerCase().slice(0, 10)}`;
}


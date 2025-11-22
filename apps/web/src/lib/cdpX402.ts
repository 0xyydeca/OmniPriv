/**
 * x402 for Delegations (Secure Sharing)
 * 
 * Use CDP's facilitator for programmable auth (e.g., delegate credential access without fees).
 * This enables agentic sharing without pop-ups.
 * 
 * Based on x402 protocol that CDP builds on:
 * https://github.com/coinbase/x402
 */

import axios from 'axios';
// TODO: When @coinbase/cdp-sdk/react export is available, use this import:
// import { useWallet } from '@coinbase/cdp-sdk/react';

const FACILITATOR_URL = 'https://facilitator.coinbase.com'; // CDP's endpoint
const APP_ID = process.env.NEXT_PUBLIC_CDP_APP_ID;

/**
 * Delegate credential access to another address
 * 
 * @param toAddress - The address to delegate access to
 * @param credentialId - The identifier for the credential to delegate
 * @param wallet - The wallet object from useWallet hook (for signing)
 * @param network - The network name (default: 'base-sepolia')
 * @returns Promise<boolean> - Whether the delegation was successful
 */
export async function delegateCredential(
  toAddress: string,
  credentialId: string,
  wallet: any, // TODO: Type this properly when useWallet hook is available
  network: string = 'base-sepolia'
): Promise<boolean> {
  if (!wallet) {
    throw new Error('Connect wallet first');
  }

  if (!APP_ID) {
    throw new Error('NEXT_PUBLIC_CDP_APP_ID not configured');
  }

  try {
    // Construct x402 payload
    const payload = {
      scheme: 'exact',
      network: network, // Match your chain (base-sepolia, base-mainnet, etc.)
      amount: '0', // Gasless delegation
      payTo: toAddress,
      description: `Delegate access to credential ${credentialId}`,
    };

    // Sign with wallet
    const signature = await wallet.signMessage(JSON.stringify(payload));
    
    // Add signature to payload
    const signedPayload = {
      ...payload,
      signature,
    };

    // Verify with CDP facilitator
    const response = await axios.post(
      `${FACILITATOR_URL}/verify`,
      signedPayload,
      {
        headers: {
          Authorization: `Bearer ${APP_ID}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.valid) {
      console.log('Delegation successful');
      // Proceed with LayerZero bridge or Aztec ZK verify
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Failed to delegate credential:', error);
    throw new Error(error.response?.data?.message || 'Delegation failed');
  }
}

/**
 * React hook wrapper for delegating credentials (for future use)
 * This can be used in components that already have useWallet hook
 * 
 * Usage (when useWallet is available):
 * ```tsx
 * import { useWallet } from '@coinbase/cdp-sdk/react';
 * 
 * function MyComponent() {
 *   const { wallet, connect } = useWallet();
 *   
 *   const handleShare = async () => {
 *     if (!wallet) await connect(); // Gasless connect via email/social
 *     await delegateCredential(userAddress, 'kyc-proof-123', wallet);
 *   };
 * }
 * ```
 */


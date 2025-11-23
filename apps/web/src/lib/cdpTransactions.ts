/**
 * CDP Transaction Utilities
 * 
 * Send transactions using CDP Embedded Wallet without wagmi
 * Uses viem for contract interactions and window.ethereum for signing
 */

import { createWalletClient, custom, type Hash, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

/**
 * Get wallet client from CDP's injected provider
 * CDP Embedded Wallet injects window.ethereum when user signs in
 */
export function getCDPWalletClient(address: Address) {
  if (typeof window === 'undefined') {
    throw new Error('Window not available');
  }

  if (!window.ethereum) {
    throw new Error('CDP wallet not connected - window.ethereum not found');
  }

  return createWalletClient({
    account: address,
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
}

/**
 * Write to a contract using CDP wallet
 * Similar to wagmi's useWriteContract but works with CDP
 */
export async function cdpWriteContract({
  address,
  abi,
  functionName,
  args = [],
  value,
  account,
}: {
  address: Address;
  abi: any;
  functionName: string;
  args?: any[];
  value?: bigint;
  account: Address;
}): Promise<Hash> {
  const client = getCDPWalletClient(account);

  // Send transaction
  const hash = await client.writeContract({
    address,
    abi,
    functionName,
    args,
    value,
  });

  return hash;
}

/**
 * Wait for transaction receipt
 * Similar to wagmi's useWaitForTransactionReceipt
 */
export async function waitForTransaction(hash: Hash): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not available');
  }

  // Poll for transaction receipt
  const maxAttempts = 60; // 60 seconds
  const pollInterval = 1000; // 1 second

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      });

      if (receipt) {
        // Transaction mined
        const status = receipt.status;
        return status === '0x1'; // Success
      }
    } catch (error) {
      console.error('Error checking receipt:', error);
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Transaction timeout - not mined after 60 seconds');
}

/**
 * React hook wrapper for CDP transactions
 * Drop-in replacement for wagmi's useWriteContract
 */
import { useState, useCallback } from 'react';

export function useCDPWriteContract() {
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<Hash | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const writeContract = useCallback(async (params: {
    address: Address;
    abi: any;
    functionName: string;
    args?: any[];
    value?: bigint;
    account: Address;
  }) => {
    setIsPending(true);
    setError(null);
    setData(undefined);

    try {
      const hash = await cdpWriteContract(params);
      setData(hash);
      return hash;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    writeContract,
    data,
    isPending,
    error,
  };
}

/**
 * React hook for waiting for transaction
 */
export function useCDPWaitForTransaction(hash: Hash | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Auto-wait when hash changes
  useState(() => {
    if (!hash) return;

    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

    waitForTransaction(hash)
      .then((success) => {
        setIsSuccess(success);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  });

  return {
    isLoading,
    isSuccess,
    error,
  };
}


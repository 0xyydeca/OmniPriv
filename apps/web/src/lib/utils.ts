/**
 * Utility functions for OmniPriv
 */

/**
 * Format an Ethereum address for display
 * Shows first 6 and last 4 characters
 */
export function formatAddress(address: string | null | undefined): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Truncate address (alias for formatAddress, matches CDP docs pattern)
 */
export const truncateAddress = formatAddress;

/**
 * Get block explorer link for a chain
 */
export function getBlockExplorerLink(
  chainId: number,
  hash: string,
  type: 'transaction' | 'address' | 'block' = 'transaction'
): string {
  const explorers: Record<number, string> = {
    84532: 'https://sepolia.basescan.org', // Base Sepolia
    11155420: 'https://sepolia-optimism.etherscan.io', // Optimism Sepolia
    1: 'https://etherscan.io', // Ethereum Mainnet
    10: 'https://optimistic.etherscan.io', // Optimism
    8453: 'https://basescan.org', // Base
  };

  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  
  if (type === 'transaction') {
    return `${baseUrl}/tx/${hash}`;
  } else if (type === 'address') {
    return `${baseUrl}/address/${hash}`;
  } else {
    return `${baseUrl}/block/${hash}`;
  }
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}


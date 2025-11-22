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


/**
 * @omnipriv/contracts
 * Contract ABIs, addresses, and utilities
 */

import deployments from '../deployments.json';

export { deployments };

// Export types
// Chain A contracts (Base Sepolia)
export interface ChainAContracts {
  VaultAnchor: string;
  ProofConsumer: string;
  IdentityOApp: string;
}

// Chain B contracts (Optimism Sepolia)
export interface ChainBContracts {
  OmniPrivVerifier: string;
}

// Union type for all possible contract configurations
export type ContractAddresses = ChainAContracts | ChainBContracts | Partial<ChainAContracts & ChainBContracts>;

export interface ChainDeployment {
  chainId: number;
  layerZeroEid: number;
  contracts: ContractAddresses;
  rpcUrl: string;
  blockExplorer: string;
}

export type Deployments = Record<string, ChainDeployment>;

/**
 * Get contract addresses for a specific chain
 */
export function getAddresses(chainId: number): ContractAddresses | null {
  const deployment = Object.values(deployments).find(
    (d) => d.chainId === chainId
  );
  return deployment?.contracts || null;
}

/**
 * Get LayerZero EID for a chain
 */
export function getLayerZeroEid(chainId: number): number | null {
  const deployment = Object.values(deployments).find(
    (d) => d.chainId === chainId
  );
  return deployment?.layerZeroEid || null;
}

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): string | null {
  const entry = Object.entries(deployments).find(
    ([, d]) => d.chainId === chainId
  );
  return entry?.[0] || null;
}


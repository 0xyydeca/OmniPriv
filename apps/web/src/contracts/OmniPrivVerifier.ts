/**
 * OmniPrivVerifier Contract ABI and Address
 * Optimism Sepolia: 0xcf1a9522FB166a1E79564b5081940a271ab5A187
 * 
 * This is the destination chain contract that receives cross-chain
 * verification messages from Base Sepolia via LayerZero.
 */

export const OMNIPRIV_VERIFIER_ADDRESS = '0xcf1a9522FB166a1E79564b5081940a271ab5A187' as const;

export const OMNIPRIV_VERIFIER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_endpoint", "type": "address" },
      { "internalType": "address", "name": "_owner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "policyId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint64", "name": "expiry", "type": "uint64" },
      { "indexed": false, "internalType": "uint64", "name": "nonce", "type": "uint64" }
    ],
    "name": "VerificationReceived",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "bytes32", "name": "policyId", "type": "bytes32" }
    ],
    "name": "isVerified",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "bytes32", "name": "policyId", "type": "bytes32" }
    ],
    "name": "getExpiry",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "bytes32", "name": "policyId", "type": "bytes32" }
    ],
    "name": "getNonce",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Chain IDs
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;


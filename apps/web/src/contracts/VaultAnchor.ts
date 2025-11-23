/**
 * VaultAnchor Contract ABI and Address
 * Base Sepolia: 0x6DB3992C31AFc84E442621fff00511e9f26335d1
 */

export const VAULT_ANCHOR_ADDRESS = '0x4DefEaA00297a3E2D501e3d8459C67118A0783E5' as const;

export const VAULT_ANCHOR_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AlreadyRevoked",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CommitmentAlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "CommitmentNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidExpiry",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ZeroCommitment",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "expiry", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CommitmentAdded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "dobYear", "type": "uint16" },
      { "internalType": "uint8", "name": "countryCode", "type": "uint8" },
      { "internalType": "uint256", "name": "salt", "type": "uint256" }
    ],
    "name": "addKycCommitment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "dobYear", "type": "uint16" },
      { "internalType": "uint8", "name": "countryCode", "type": "uint8" },
      { "internalType": "uint256", "name": "salt", "type": "uint256" },
      { "internalType": "address", "name": "issuer", "type": "address" },
      { "internalType": "bytes32", "name": "schema", "type": "bytes32" }
    ],
    "name": "computeCommitment",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "internalType": "uint256", "name": "expiry", "type": "uint256" }
    ],
    "name": "addCommitment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" }
    ],
    "name": "isCommitmentValid",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserCommitments",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


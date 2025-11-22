/**
 * ProofConsumer Contract ABI and Address
 * Base Sepolia: 0xdC98b38F092413fedc31ef42667C71907fc5350A
 */

export const PROOF_CONSUMER_ADDRESS = '0xdC98b38F092413fedc31ef42667C71907fc5350A' as const;

export const PROOF_CONSUMER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_vaultAnchor", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CommitmentInvalid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidProof",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NonceAlreadyUsed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PolicyInactive",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "policyId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "schemaId", "type": "string" },
      { "indexed": false, "internalType": "address[]", "name": "allowedIssuers", "type": "address[]" }
    ],
    "name": "PolicyAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "policyId", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "indexed": false, "internalType": "bool", "name": "success", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "ProofVerified",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "policyId", "type": "bytes32" },
      { "internalType": "string", "name": "schemaId", "type": "string" },
      { "internalType": "address[]", "name": "allowedIssuers", "type": "address[]" }
    ],
    "name": "addPolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
    "inputs": [],
    "name": "mockVerificationEnabled",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "proof", "type": "bytes" },
      { "internalType": "bytes32[]", "name": "publicSignals", "type": "bytes32[]" },
      { "internalType": "bytes32", "name": "policyId", "type": "bytes32" }
    ],
    "name": "verifyProof",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vaultAnchor",
    "outputs": [{ "internalType": "contract IVaultAnchor", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


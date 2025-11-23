/**
 * IdentityOApp Contract ABI and Address
 * This is the contract that ACTUALLY receives cross-chain verification messages!
 * 
 * Base Sepolia: 0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275
 * Optimism Sepolia: 0x591A2902FB1853A0fca20b163a63720b7579B473
 */

export const IDENTITY_OAPP_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bytes32', name: 'policyId', type: 'bytes32' }
    ],
    name: 'isVerified',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bytes32', name: 'policyId', type: 'bytes32' }
    ],
    name: 'getVerification',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'user', type: 'address' },
          { internalType: 'bytes32', name: 'policyId', type: 'bytes32' },
          { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
          { internalType: 'uint256', name: 'expiry', type: 'uint256' },
          { internalType: 'uint32', name: 'sourceEid', type: 'uint32' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'bool', name: 'active', type: 'bool' }
        ],
        internalType: 'struct IdentityOApp.CrossChainVerification',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' }
    ],
    name: 'getUserPolicies',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'dstEid', type: 'uint32' },
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bytes32', name: 'policyId', type: 'bytes32' },
      { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
      { internalType: 'uint256', name: 'expiry', type: 'uint256' },
      { internalType: 'bytes', name: 'options', type: 'bytes' }
    ],
    name: 'sendVerification',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint32', name: 'dstEid', type: 'uint32' },
      { indexed: false, internalType: 'bytes32', name: 'policyId', type: 'bytes32' },
      { indexed: false, internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'expiry', type: 'uint256' }
    ],
    name: 'VerificationSent',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: true, internalType: 'uint32', name: 'srcEid', type: 'uint32' },
      { indexed: false, internalType: 'bytes32', name: 'policyId', type: 'bytes32' },
      { indexed: false, internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
      { indexed: false, internalType: 'uint256', name: 'expiry', type: 'uint256' }
    ],
    name: 'VerificationReceived',
    type: 'event'
  }
] as const;

// Contract addresses
export const IDENTITY_OAPP_ADDRESS = {
  BASE_SEPOLIA: '0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275' as const,
  OPTIMISM_SEPOLIA: '0x591A2902FB1853A0fca20b163a63720b7579B473' as const,
} as const;


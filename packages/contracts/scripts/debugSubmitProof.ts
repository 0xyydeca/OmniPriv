/**
 * Debug Script: submitProofAndBridge Revert Analysis
 * 
 * This script simulates a submitProofAndBridge call to identify the exact revert reason.
 * 
 * Observed Revert Reasons from ProofConsumer.sol:
 * - IdentityOAppNotSet() - Line 199
 * - PolicyInactive() - Line 112 (in verifyProof)
 * - NonceAlreadyUsed() - Line 119 (in verifyProof)
 * - CommitmentInvalid() - Line 125 (in verifyProof)
 * - InvalidProof() - Line 203
 */

import { createPublicClient, http, decodeErrorResult, keccak256, toBytes } from 'viem';
import { baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/web/.env.local
dotenv.config({ path: resolve(__dirname, '../../../apps/web/.env.local') });

// ABI for ProofConsumer (minimal for debugging)
const proofConsumerAbi = [
  {
    "inputs": [],
    "name": "CommitmentInvalid",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "IdentityOAppNotSet",
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
    "inputs": [],
    "name": "PolicyNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32[]",
        "name": "publicSignals",
        "type": "bytes32[]"
      },
      {
        "internalType": "bytes32",
        "name": "policyId",
        "type": "bytes32"
      },
      {
        "internalType": "uint32",
        "name": "dstEid",
        "type": "uint32"
      },
      {
        "internalType": "bytes",
        "name": "options",
        "type": "bytes"
      }
    ],
    "name": "submitProofAndBridge",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "policies",
    "outputs": [
      {
        "internalType": "string",
        "name": "schemaId",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "identityOApp",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

async function main() {
  console.log('🔍 ProofConsumer Debug Script\n');
  console.log('='.repeat(60));
  
  // Setup
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
  const proofConsumerAddress = process.env.NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA as `0x${string}`;
  const testUserAddress = process.env.NEXT_PUBLIC_TEST_USER_ADDRESS || '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';
  
  if (!proofConsumerAddress) {
    throw new Error('NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA not set in .env.local');
  }
  
  console.log('📋 Configuration:');
  console.log(`  RPC URL: ${rpcUrl}`);
  console.log(`  ProofConsumer: ${proofConsumerAddress}`);
  console.log(`  Test User: ${testUserAddress}`);
  console.log('');
  
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  
  // Calculate policy ID (same as frontend: keccak256("kyc_policy"))
  const policyId = keccak256(toBytes('kyc_policy'));
  console.log(`📝 Policy ID: ${policyId}`);
  console.log('');
  
  // Check contract state
  console.log('🔍 Checking Contract State...\n');
  
  // 1. Check if IdentityOApp is set
  try {
    const identityOAppAddress = await client.readContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'identityOApp',
    });
    console.log(`✅ IdentityOApp Address: ${identityOAppAddress}`);
    if (identityOAppAddress === '0x0000000000000000000000000000000000000000') {
      console.log('   ⚠️  WARNING: IdentityOApp not set! Will revert with IdentityOAppNotSet()');
    }
  } catch (err) {
    console.error('❌ Failed to read identityOApp:', err);
  }
  
  // 2. Check policy configuration
  try {
    const policy = await client.readContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'policies',
      args: [policyId],
    });
    console.log(`\n📋 Policy Configuration:`);
    console.log(`  Schema ID: ${policy[0]}`);
    console.log(`  Active: ${policy[1]}`);
    
    if (!policy[1]) {
      console.log('   ⚠️  WARNING: Policy is NOT active! Will revert with PolicyInactive()');
    }
    if (policy[0] === '') {
      console.log('   ⚠️  WARNING: Policy schema is empty! Policy might not be configured.');
    }
  } catch (err) {
    console.error('❌ Failed to read policy:', err);
  }
  
  // 3. Check user's nonce
  try {
    const nonce = await client.readContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'nonces',
      args: [testUserAddress as `0x${string}`],
    });
    console.log(`\n🔢 User Nonce: ${nonce}`);
    console.log(`   (Next valid nonce must be > ${nonce})`);
  } catch (err) {
    console.error('❌ Failed to read nonce:', err);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Simulating submitProofAndBridge Call...\n');
  
  // Prepare dummy arguments
  const dummyProof = '0x' + '11'.repeat(32);
  const dummyCommitment = '0x759f517d5fe5bd8644c22d870a13cbcdc36b02043f2dffbecc116a2f24d012b1'; // Real commitment from logs
  const dummyNonce = BigInt(Date.now()); // High nonce to avoid NonceAlreadyUsed
  const dummyPublicSignals: `0x${string}`[] = [
    dummyCommitment as `0x${string}`,
    policyId as `0x${string}`,
    `0x${dummyNonce.toString(16).padStart(64, '0')}` as `0x${string}`,
  ];
  
  console.log('📦 Simulation Parameters:');
  console.log(`  Proof: ${dummyProof.substring(0, 20)}...`);
  console.log(`  Public Signals:`);
  console.log(`    [0] Commitment: ${dummyPublicSignals[0]}`);
  console.log(`    [1] Policy ID: ${dummyPublicSignals[1]}`);
  console.log(`    [2] Nonce: ${dummyPublicSignals[2]}`);
  console.log(`  Destination EID: 40232 (Optimism Sepolia)`);
  console.log(`  Options: 0x`);
  console.log('');
  
  try {
    await client.simulateContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'submitProofAndBridge',
      args: [
        dummyProof as `0x${string}`,
        dummyPublicSignals,
        policyId as `0x${string}`,
        40232,
        '0x' as `0x${string}`,
      ],
      account: testUserAddress as `0x${string}`,
      value: 0n,
    });
    
    console.log('✅ SUCCESS: Simulation passed! No revert detected.');
    console.log('   This means the contract would accept the transaction.');
    console.log('');
  } catch (err: any) {
    console.error('❌ SIMULATION REVERTED\n');
    console.error('Error message:', err?.cause?.shortMessage || err?.message || err);
    console.log('');
    
    // Try to decode custom error
    if (err?.data) {
      try {
        const decoded = decodeErrorResult({
          abi: proofConsumerAbi,
          data: err.data,
        });
        console.log('🔍 Decoded Custom Error:');
        console.log(`   Error Name: ${decoded.errorName}`);
        console.log(`   Error Args: ${JSON.stringify(decoded.args)}`);
        console.log('');
        
        // Provide specific guidance
        console.log('💡 Fix Guidance:');
        switch (decoded.errorName) {
          case 'IdentityOAppNotSet':
            console.log('   Run: pnpm hardhat run scripts/setIdentityOApp.ts --network baseSepolia');
            console.log('   This sets the IdentityOApp address on ProofConsumer');
            break;
          case 'PolicyInactive':
            console.log('   Run: pnpm hardhat run scripts/configurePolicy.ts --network baseSepolia');
            console.log('   This configures and activates the kyc_policy');
            break;
          case 'CommitmentInvalid':
            console.log('   The commitment is not in VaultAnchor for this user.');
            console.log('   User must call addKycCommitment on VaultAnchor first.');
            break;
          case 'NonceAlreadyUsed':
            console.log('   The nonce in the proof is too low (replay protection).');
            console.log('   Generate a new proof with a higher nonce.');
            break;
          case 'InvalidProof':
            console.log('   The proof verification failed (returned false).');
            console.log('   Check proof generation logic.');
            break;
          default:
            console.log('   Unknown error. Check contract logs.');
        }
      } catch (decodeErr) {
        console.error('⚠️  Could not decode custom error');
        console.error('   Raw error data:', err.data);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Debug script complete');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


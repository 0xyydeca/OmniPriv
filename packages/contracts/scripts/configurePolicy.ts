/**
 * Configure Policy Script
 * 
 * This script configures the kyc_policy on the deployed ProofConsumer contract.
 * 
 * The policy configuration includes:
 * - Policy ID: keccak256("kyc_policy")
 * - Schema ID: "kyc_v1"
 * - Allowed Issuers: [0x0000000000000000000000000000000000000000] (self-attested for hackathon)
 * - Active: true (set in addPolicy function)
 */

import {  createWalletClient, createPublicClient, http, keccak256, toBytes } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../../apps/web/.env.local') });

const proofConsumerAbi = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "policyId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "schemaId",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "allowedIssuers",
        "type": "address[]"
      }
    ],
    "name": "addPolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
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
  }
] as const;

async function main() {
  console.log('🔧 Configuring Policy on ProofConsumer\n');
  console.log('='.repeat(60));
  
  // Get configuration from environment
  const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
  const proofConsumerAddress = process.env.NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA as `0x${string}`;
  const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!proofConsumerAddress) {
    throw new Error('NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA not set in .env.local');
  }
  
  if (!deployerPrivateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY not set in .env.local');
  }
  
  console.log('📋 Configuration:');
  console.log(`  RPC URL: ${rpcUrl}`);
  console.log(`  ProofConsumer: ${proofConsumerAddress}`);
  console.log('');
  
  // Setup clients
  const account = privateKeyToAccount(deployerPrivateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
  
  console.log(`🔑 Deployer Address: ${account.address}\n`);
  
  // Policy configuration
  const policyId = keccak256(toBytes('kyc_policy'));
  const schemaId = 'kyc_v1';
  const allowedIssuers = ['0x0000000000000000000000000000000000000000']; // Self-attested for hackathon
  
  console.log('📝 Policy Configuration:');
  console.log(`  Policy ID: ${policyId}`);
  console.log(`  Schema ID: ${schemaId}`);
  console.log(`  Allowed Issuers: ${allowedIssuers.join(', ')}`);
  console.log(`  Active: true (set automatically by addPolicy)`);
  console.log('');
  
  // Check if policy already exists
  console.log('🔍 Checking existing policy...');
  try {
    const existingPolicy = await publicClient.readContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'policies',
      args: [policyId],
    });
    
    console.log(`  Existing Schema ID: ${existingPolicy[0]}`);
    console.log(`  Existing Active: ${existingPolicy[1]}`);
    
    if (existingPolicy[1] && existingPolicy[0] === schemaId) {
      console.log('\n✅ Policy already configured correctly!');
      console.log('   No need to send transaction.');
      return;
    }
    
    if (existingPolicy[0] !== '' || existingPolicy[1]) {
      console.log('\n⚠️  Policy exists but differs from desired config. Will update...');
    }
  } catch (err) {
    console.log('  No existing policy found.');
  }
  
  console.log('\n🚀 Sending addPolicy transaction...');
  
  try {
    // Simulate first
    await publicClient.simulateContract({
      account,
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'addPolicy',
      args: [policyId, schemaId, allowedIssuers as `0x${string}`[]],
    });
    
    console.log('  ✅ Simulation successful');
    
    // Send transaction
    const hash = await walletClient.writeContract({
      address: proofConsumerAddress,
      abi: proofConsumerAbi,
      functionName: 'addPolicy',
      args: [policyId, schemaId, allowedIssuers as `0x${string}`[]],
    });
    
    console.log(`\n📤 Transaction sent: ${hash}`);
    console.log(`   BaseScan: https://sepolia.basescan.org/tx/${hash}`);
    console.log('\n⏳ Waiting for confirmation...');
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log('✅ Transaction confirmed!\n');
      
      // Verify policy was set
      const newPolicy = await publicClient.readContract({
        address: proofConsumerAddress,
        abi: proofConsumerAbi,
        functionName: 'policies',
        args: [policyId],
      });
      
      console.log('🔍 Verification:');
      console.log(`  Schema ID: ${newPolicy[0]}`);
      console.log(`  Active: ${newPolicy[1]}`);
      
      if (newPolicy[1] && newPolicy[0] === schemaId) {
        console.log('\n✅ Policy configured successfully!');
        console.log('   You can now submit proofs for this policy.');
      } else {
        console.log('\n⚠️  Policy verification failed. Check contract state manually.');
      }
    } else {
      console.log('❌ Transaction failed!');
      console.log(`   Receipt: ${JSON.stringify(receipt, null, 2)}`);
    }
  } catch (err: any) {
    console.error('\n❌ Error configuring policy:');
    console.error(err?.message || err);
    
    if (err?.cause) {
      console.error('\nCause:', err.cause);
    }
    
    throw err;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Script complete');
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});


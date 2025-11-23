import { ethers } from 'hardhat';

/**
 * Setup Demo Mode for Hackathon Presentation
 * 
 * This script:
 * 1. Sets the demo user address on ProofConsumer (Base Sepolia)
 * 2. Enables demo mode
 * 3. Pre-verifies the demo user on both chains
 * 
 * Usage: pnpm hardhat run scripts/setupDemoMode.ts --network baseSepolia
 */

async function main() {
  console.log('\n🎬 Setting up Demo Mode for Hackathon...\n');

  // Contract addresses
  const PROOF_CONSUMER_BASE = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
  const IDENTITY_OAPP_OPTIMISM = '0x77b72Fa4bfDB4151c3Ed958f8B0c0fF6e90e70BB';
  
  // Demo wallet address (CDP embedded wallet used in presentation)
  // TODO: Replace with your actual CDP wallet address from the UI
  const DEMO_USER = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143'; // Example - update this!
  
  // Policy ID for KYC
  const POLICY_ID = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy'));
  
  // Commitment (can be dummy for demo mode since checks are bypassed)
  const DEMO_COMMITMENT = ethers.keccak256(ethers.toUtf8Bytes('demo_commitment'));
  
  // Expiry: 30 days from now
  const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  console.log('Demo Configuration:');
  console.log('  Demo User:', DEMO_USER);
  console.log('  Policy ID:', POLICY_ID);
  console.log('  Commitment:', DEMO_COMMITMENT);
  console.log('  Expiry:', new Date(expiry * 1000).toISOString());
  console.log('');

  // ===== STEP 1: Configure ProofConsumer on Base Sepolia =====
  console.log('📍 Step 1: Configuring ProofConsumer on Base Sepolia...');
  
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER_BASE);
  
  // Set demo user
  console.log('  Setting demo user...');
  const tx1 = await proofConsumer.setDemoUser(DEMO_USER);
  await tx1.wait();
  console.log('  ✅ Demo user set:', DEMO_USER);
  
  // Ensure demo mode is enabled
  console.log('  Enabling demo mode...');
  const tx2 = await proofConsumer.setDemoMode(true);
  await tx2.wait();
  console.log('  ✅ Demo mode enabled');
  
  // Pre-verify the demo user on Base Sepolia
  console.log('  Pre-verifying demo user on Base Sepolia...');
  const tx3 = await proofConsumer.adminForceVerify(
    DEMO_USER,
    POLICY_ID,
    DEMO_COMMITMENT,
    expiry
  );
  await tx3.wait();
  console.log('  ✅ Demo user pre-verified on Base Sepolia');
  
  // Verify the setup
  const isVerified = await proofConsumer.isVerified(DEMO_USER, POLICY_ID);
  console.log('  Verification check:', isVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED');
  console.log('');

  // ===== STEP 2: Pre-verify on Optimism Sepolia =====
  console.log('📍 Step 2: Instructions for Optimism Sepolia...');
  console.log('');
  console.log('⚠️  You need to run this on Optimism Sepolia network:');
  console.log('');
  console.log('  pnpm hardhat run scripts/setupDemoModeOptimism.ts --network optimismSepolia');
  console.log('');
  console.log('  Or manually call:');
  console.log('  cast send', IDENTITY_OAPP_OPTIMISM, '\\');
  console.log('    "adminForceVerify(address,bytes32,bytes32,uint256,uint32)" \\');
  console.log('    ', DEMO_USER, '\\');
  console.log('    ', POLICY_ID, '\\');
  console.log('    ', DEMO_COMMITMENT, '\\');
  console.log('    ', expiry, '\\');
  console.log('    ', '40245', '\\ # Base Sepolia EID');
  console.log('    --rpc-url $OPTIMISM_SEPOLIA_RPC --private-key $PRIVATE_KEY');
  console.log('');

  console.log('✅ Demo Mode Setup Complete on Base Sepolia!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('  1. Run the Optimism Sepolia setup (see instructions above)');
  console.log('  2. Test the UI flow with the demo wallet');
  console.log('  3. Verify transactions work without CDP/commitment issues');
  console.log('');
  console.log('🎯 For the demo:');
  console.log('  - Connect with:', DEMO_USER);
  console.log('  - Click "Generate ZK Proof & Verify"');
  console.log('  - Transaction should succeed instantly (demo mode bypass)');
  console.log('  - Verification shows on both chains');
  console.log('');
  console.log('⚠️  Remember to tell judges:');
  console.log('  "Due to time constraints, we enabled demo mode which bypasses');
  console.log('   commitment verification for this wallet. In production, the full');
  console.log('   ZK proof verification path would be used."');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


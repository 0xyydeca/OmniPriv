import { ethers } from 'hardhat';

/**
 * Setup Demo Mode on Optimism Sepolia
 * 
 * Pre-verifies the demo user on Optimism Sepolia so that
 * dApps can query verification status immediately.
 * 
 * Usage: pnpm hardhat run scripts/setupDemoModeOptimism.ts --network optimismSepolia
 */

async function main() {
  console.log('\n🎬 Setting up Demo Mode on Optimism Sepolia...\n');

  // Contract address
  const IDENTITY_OAPP_OPTIMISM = '0x77b72Fa4bfDB4151c3Ed958f8B0c0fF6e90e70BB';
  
  // Demo wallet address (must match Base Sepolia setup)
  const DEMO_USER = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143'; // Update this!
  
  // Policy ID for KYC
  const POLICY_ID = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy'));
  
  // Commitment (dummy for demo)
  const DEMO_COMMITMENT = ethers.keccak256(ethers.toUtf8Bytes('demo_commitment'));
  
  // Expiry: 30 days from now
  const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  
  // Source chain: Base Sepolia
  const BASE_SEPOLIA_EID = 40245;

  console.log('Demo Configuration:');
  console.log('  Demo User:', DEMO_USER);
  console.log('  Policy ID:', POLICY_ID);
  console.log('  Commitment:', DEMO_COMMITMENT);
  console.log('  Expiry:', new Date(expiry * 1000).toISOString());
  console.log('  Source Chain:', 'Base Sepolia (EID:', BASE_SEPOLIA_EID, ')');
  console.log('');

  // Get contract
  const identityOApp = await ethers.getContractAt('IdentityOApp', IDENTITY_OAPP_OPTIMISM);
  
  // Pre-verify the demo user
  console.log('📍 Pre-verifying demo user on Optimism Sepolia...');
  const tx = await identityOApp.adminForceVerify(
    DEMO_USER,
    POLICY_ID,
    DEMO_COMMITMENT,
    expiry,
    BASE_SEPOLIA_EID
  );
  
  console.log('  Transaction sent:', tx.hash);
  console.log('  Waiting for confirmation...');
  await tx.wait();
  console.log('  ✅ Transaction confirmed!');
  console.log('');

  // Verify the setup
  console.log('📍 Verifying setup...');
  const isVerified = await identityOApp.isVerified(DEMO_USER, POLICY_ID);
  console.log('  Verification status:', isVerified ? '✅ VERIFIED' : '❌ NOT VERIFIED');
  
  const verification = await identityOApp.getVerification(DEMO_USER, POLICY_ID);
  console.log('  Verification details:');
  console.log('    User:', verification.user);
  console.log('    Policy ID:', verification.policyId);
  console.log('    Commitment:', verification.commitment);
  console.log('    Expiry:', new Date(Number(verification.expiry) * 1000).toISOString());
  console.log('    Source EID:', verification.sourceEid);
  console.log('    Timestamp:', new Date(Number(verification.timestamp) * 1000).toISOString());
  console.log('    Active:', verification.active);
  console.log('');

  console.log('✅ Demo Mode Setup Complete on Optimism Sepolia!');
  console.log('');
  console.log('🎯 The demo user is now verified on both chains:');
  console.log('  Base Sepolia: ProofConsumer contract');
  console.log('  Optimism Sepolia: IdentityOApp contract');
  console.log('');
  console.log('📱 Test the dApp:');
  console.log('  Go to /dapp page');
  console.log('  Should show: "✅ Verified for kyc_policy"');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


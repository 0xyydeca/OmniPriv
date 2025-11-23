import { ethers } from 'hardhat';

async function checkMockMode() {
  const PROOF_CONSUMER_ADDRESS = '0xdC98b38F092413fedc31ef42667C71907fc5350A';

  console.log('\n🔍 Checking ProofConsumer mock mode...\n');
  
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER_ADDRESS);
  
  try {
    const isMockEnabled = await proofConsumer.mockVerificationEnabled();
    console.log('Mock Verification Enabled:', isMockEnabled);
    
    if (isMockEnabled) {
      console.log('\n✅ Contract is in MOCK mode - proofs will auto-pass');
    } else {
      console.log('\n⚠️  Contract is in PRODUCTION mode - requires REAL ZK proofs');
      console.log('   This might cause gas estimation to fail if proof is invalid');
    }
  } catch (error) {
    console.log('⚠️  mockVerificationEnabled() not found - might be older contract version');
  }
}

checkMockMode()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


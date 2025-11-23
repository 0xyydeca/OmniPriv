import { ethers } from 'hardhat';

async function checkSetup() {
  const PROOF_CONSUMER_ADDRESS = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
  const EXPECTED_IDENTITY_OAPP = '0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275';

  console.log('\n🔍 Checking ProofConsumer setup on Base Sepolia...\n');
  
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER_ADDRESS);
  
  // Check if IdentityOApp is set
  const currentOApp = await proofConsumer.identityOApp();
  console.log('Current IdentityOApp:', currentOApp);
  console.log('Expected:', EXPECTED_IDENTITY_OAPP);
  
  if (currentOApp.toLowerCase() === EXPECTED_IDENTITY_OAPP.toLowerCase()) {
    console.log('\n✅ ProofConsumer is correctly configured!');
  } else if (currentOApp === ethers.ZeroAddress) {
    console.log('\n❌ IdentityOApp is NOT SET! Run: pnpm setup:proofConsumer');
  } else {
    console.log('\n⚠️ IdentityOApp is set to WRONG address!');
    console.log('   Run: pnpm setup:proofConsumer');
  }
}

checkSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


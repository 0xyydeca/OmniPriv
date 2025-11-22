import { ethers, network } from 'hardhat';
import { ProofConsumer } from '../typechain-types';

/**
 * Set IdentityOApp address on ProofConsumer
 * This allows ProofConsumer.submitProofAndBridge() to call IdentityOApp
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('\n🔗 Setting IdentityOApp on ProofConsumer...');
  console.log('Network:', network.name);
  console.log('Deployer:', deployer.address);
  
  // Contract addresses
  const PROOF_CONSUMER_ADDRESS = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
  const IDENTITY_OAPP_ADDRESS = '0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48';
  
  console.log('\nProofConsumer:', PROOF_CONSUMER_ADDRESS);
  console.log('IdentityOApp:', IDENTITY_OAPP_ADDRESS);
  
  // Get ProofConsumer contract
  const proofConsumer = await ethers.getContractAt(
    'ProofConsumer',
    PROOF_CONSUMER_ADDRESS
  ) as ProofConsumer;
  
  // Check current IdentityOApp (if any)
  try {
    const currentOApp = await proofConsumer.identityOApp();
    console.log('\nCurrent IdentityOApp:', currentOApp);
    
    if (currentOApp.toLowerCase() === IDENTITY_OAPP_ADDRESS.toLowerCase()) {
      console.log('✅ IdentityOApp already set correctly!');
      return;
    }
  } catch (error) {
    console.log('\nNo IdentityOApp set yet.');
  }
  
  // Set IdentityOApp
  console.log('\n📡 Calling setIdentityOApp()...');
  const tx = await proofConsumer.setIdentityOApp(IDENTITY_OAPP_ADDRESS);
  console.log('Transaction:', tx.hash);
  
  await tx.wait();
  console.log('✅ Transaction confirmed!');
  
  // Verify
  const newOApp = await proofConsumer.identityOApp();
  console.log('\nVerified IdentityOApp:', newOApp);
  
  if (newOApp.toLowerCase() === IDENTITY_OAPP_ADDRESS.toLowerCase()) {
    console.log('✅ IdentityOApp set successfully!');
  } else {
    console.error('❌ IdentityOApp mismatch!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


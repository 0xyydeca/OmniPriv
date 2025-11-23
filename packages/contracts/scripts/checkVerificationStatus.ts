import { ethers } from 'hardhat';

const PROOF_CONSUMER = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';

async function main() {
  console.log('\n🔍 Checking verification status...\n');
  console.log('User:', USER_ADDRESS);
  
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER);
  
  // Check the main policy
  const policyId = ethers.id('kyc_policy');
  console.log('Policy ID:', policyId);
  
  const isVerified = await proofConsumer.isVerified(USER_ADDRESS, policyId);
  console.log('\nVerification Status:', isVerified ? '✅ VERIFIED' : '❌ Not verified');
  
  if (isVerified) {
    const verification = await proofConsumer.getVerification(USER_ADDRESS, policyId);
    console.log('\nVerification Details:');
    console.log('  Commitment:', verification.commitment);
    console.log('  Expiry:', new Date(Number(verification.expiry) * 1000).toLocaleString());
    console.log('  Timestamp:', new Date(Number(verification.timestamp) * 1000).toLocaleString());
  }
  
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


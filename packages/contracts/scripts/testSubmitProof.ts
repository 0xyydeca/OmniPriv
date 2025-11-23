import { ethers } from 'hardhat';

/**
 * Test script to debug submitProofAndBridge calls
 * 
 * Usage:
 * 1. Copy the calldata from frontend console logs
 * 2. Replace CALLDATA below with the logged value
 * 3. Run: pnpm hardhat run scripts/testSubmitProof.ts --network baseSepolia
 */

const PROOF_CONSUMER = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143'; // Your CDP wallet

// Replace this with the calldata from your frontend logs
const CALLDATA = '0x'; // <-- PASTE CALLDATA HERE

async function main() {
  console.log('\n🧪 Testing submitProofAndBridge call...\n');
  console.log('Contract:', PROOF_CONSUMER);
  console.log('From (simulated):', USER_ADDRESS);
  console.log('Calldata:', CALLDATA);
  console.log('');

  if (CALLDATA === '0x') {
    console.log('⚠️  No calldata provided!');
    console.log('📋 Instructions:');
    console.log('1. Run the frontend and try to verify');
    console.log('2. Copy the "Encoded calldata" from console logs');
    console.log('3. Paste it in this script as CALLDATA');
    console.log('4. Re-run this script');
    console.log('');
    return;
  }

  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER);

  console.log('🔍 Attempting to estimate gas (this is what CDP does)...');
  console.log('');

  try {
    // Try to estimate gas (this is what fails in CDP)
    const gasEstimate = await ethers.provider.estimateGas({
      from: USER_ADDRESS,
      to: PROOF_CONSUMER,
      data: CALLDATA,
      value: 0, // No ETH sent
    });

    console.log('✅ Gas estimation succeeded!');
    console.log('   Estimated gas:', gasEstimate.toString());
    console.log('');
    console.log('💡 If this works but CDP fails, it might be a CDP-specific issue.');
    console.log('');

  } catch (error: any) {
    console.error('❌ Gas estimation FAILED (same as CDP)');
    console.error('');
    console.error('Error message:', error.message);
    
    // Try to decode revert reason
    if (error.data) {
      console.error('Error data:', error.data);
      
      // Try to decode common revert reasons
      try {
        const reason = ethers.toUtf8String('0x' + error.data.slice(138));
        console.error('Decoded revert reason:', reason);
      } catch {
        console.error('Could not decode revert reason');
      }
    }
    
    console.error('');
    console.log('🔍 Possible causes:');
    console.log('1. Commitment not in VaultAnchor for this user');
    console.log('2. Invalid proof format');
    console.log('3. Invalid public signals');
    console.log('4. IdentityOApp not set in ProofConsumer');
    console.log('5. Mock mode disabled and proof verification failing');
    console.log('');
    
    // Check some common issues
    console.log('🔍 Checking common issues...');
    console.log('');
    
    // Check if IdentityOApp is set
    try {
      const identityOAppAddr = await proofConsumer.identityOApp();
      console.log('✅ IdentityOApp is set:', identityOAppAddr);
    } catch {
      console.log('❌ Could not read identityOApp address');
    }
    
    // Check mock mode
    try {
      const mockMode = await proofConsumer.mockVerificationEnabled();
      console.log(`${mockMode ? '✅' : '❌'} Mock mode:`, mockMode);
    } catch {
      console.log('❌ Could not read mockVerificationEnabled');
    }
    
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('Next steps:');
  console.log('1. If gas estimation succeeded here but fails in CDP:');
  console.log('   → Issue is CDP-specific (wallet state, nonce, etc.)');
  console.log('2. If gas estimation failed here:');
  console.log('   → Check the revert reasons above');
  console.log('   → Verify commitment exists on-chain');
  console.log('   → Verify all contract setup is correct');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


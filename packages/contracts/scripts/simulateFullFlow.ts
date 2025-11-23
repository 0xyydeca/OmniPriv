import { ethers } from 'hardhat';

/**
 * Simulate the full verification flow to find where it breaks
 */

const VAULT_ANCHOR = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';
const PROOF_CONSUMER = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';

// Test values (matching frontend)
const DOB_YEAR = 2000;
const COUNTRY_CODE = 1;
const SECRET_SALT = BigInt('12345678901234567890');
const SCHEMA_ID = 'kyc_v1';

async function main() {
  console.log('\n🔍 FULL FLOW SIMULATION\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('User Address:', USER_ADDRESS);
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Calculate commitment
  console.log('📍 STEP 1: Calculate Commitment');
  const packed = ethers.solidityPacked(
    ['uint256', 'uint256', 'uint256', 'address', 'bytes32'],
    [DOB_YEAR, COUNTRY_CODE, SECRET_SALT, USER_ADDRESS, ethers.id(SCHEMA_ID)]
  );
  const commitment = ethers.keccak256(packed);
  console.log('  DOB Year:', DOB_YEAR);
  console.log('  Country Code:', COUNTRY_CODE);
  console.log('  Secret Salt:', SECRET_SALT.toString());
  console.log('  Issuer:', USER_ADDRESS);
  console.log('  Schema:', SCHEMA_ID);
  console.log('  → Commitment:', commitment);
  console.log('');

  // Step 2: Check if commitment exists in VaultAnchor
  console.log('📍 STEP 2: Check VaultAnchor');
  const vaultAnchor = await ethers.getContractAt('VaultAnchor', VAULT_ANCHOR);
  
  const isValid = await vaultAnchor.isCommitmentValid(USER_ADDRESS, commitment);
  console.log('  isCommitmentValid:', isValid ? '✅ YES' : '❌ NO');
  
  if (!isValid) {
    console.log('  ❌ PROBLEM: Commitment not found for this user!');
    console.log('  🔧 Solution: User must call vaultAnchor.addCommitment() first');
    console.log('');
    
    const userCommitments = await vaultAnchor.getUserCommitments(USER_ADDRESS);
    console.log('  User has', userCommitments.length, 'commitments on-chain:');
    if (userCommitments.length === 0) {
      console.log('    (none)');
    } else {
      userCommitments.forEach((c: any, i: number) => {
        console.log(`    ${i + 1}. ${c}`);
      });
    }
    console.log('');
  } else {
    console.log('  ✅ Commitment exists!');
    console.log('');
  }

  // Step 3: Check ProofConsumer setup
  console.log('📍 STEP 3: Check ProofConsumer Setup');
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER);
  
  const identityOAppAddr = await proofConsumer.identityOApp();
  console.log('  identityOApp:', identityOAppAddr);
  console.log('  ', identityOAppAddr === ethers.ZeroAddress ? '❌ NOT SET' : '✅ Set');
  
  const mockMode = await proofConsumer.mockVerificationEnabled();
  console.log('  mockVerificationEnabled:', mockMode ? '✅ true (proofs auto-pass)' : '❌ false (real ZK verification)');
  console.log('');

  // Step 4: Simulate verification
  console.log('📍 STEP 4: Simulate Verification Call');
  
  if (!isValid) {
    console.log('  ⚠️  Skipping - commitment doesn\'t exist');
    console.log('');
  } else {
    // Create dummy proof data
    const dummyProof = '0x' + '00'.repeat(64); // 64 bytes of zeros
    const publicSignals = [
      commitment, // commitment
      ethers.id('kyc_policy'), // policyId
      ethers.zeroPadValue(ethers.toBeHex(2024), 32), // currentYear
      ethers.zeroPadValue(ethers.toBeHex(Math.floor(Date.now() / 1000) + 30 * 86400), 32), // expiry
      ethers.zeroPadValue(ethers.toBeHex(1), 32), // nonce
    ];
    
    console.log('  Testing with dummy proof data...');
    
    try {
      const gasEstimate = await ethers.provider.estimateGas({
        from: USER_ADDRESS,
        to: PROOF_CONSUMER,
        data: proofConsumer.interface.encodeFunctionData('submitProofAndBridge', [
          dummyProof,
          publicSignals,
          ethers.id('kyc_policy'),
          40232, // Optimism Sepolia
          '0x', // empty options
        ]),
        value: 0,
      });
      
      console.log('  ✅ Gas estimation succeeded!');
      console.log('     Estimated gas:', gasEstimate.toString());
    } catch (error: any) {
      console.log('  ❌ Gas estimation failed!');
      console.log('     Error:', error.message);
      
      if (error.data) {
        try {
          // Try to get revert reason
          const iface = proofConsumer.interface;
          const decodedError = iface.parseError(error.data);
          console.log('     Revert reason:', decodedError?.name);
        } catch {
          console.log('     Error data:', error.data);
        }
      }
    }
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  if (!isValid) {
    console.log('❌ Main issue: Commitment not in VaultAnchor');
    console.log('');
    console.log('🔧 Fix:');
    console.log('   1. User must add credential from frontend first');
    console.log('   2. User must approve the addCommitment transaction');
    console.log('   3. Wait for transaction confirmation');
    console.log('   4. Then try verification');
  } else if (identityOAppAddr === ethers.ZeroAddress) {
    console.log('❌ Main issue: IdentityOApp not set in ProofConsumer');
    console.log('');
    console.log('🔧 Fix:');
    console.log('   Run: pnpm hardhat run scripts/setupProofConsumer.ts --network baseSepolia');
  } else {
    console.log('✅ All checks passed!');
    console.log('   If verification still fails, check:');
    console.log('   - Proof format/encoding');
    console.log('   - Public signals order/values');
    console.log('   - LayerZero fee requirements');
  }
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


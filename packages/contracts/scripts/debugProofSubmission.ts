import { ethers } from 'hardhat';

/**
 * Debug why proof submission is failing
 * Checks all the requirements that ProofConsumer.submitProofAndBridge needs
 */

async function main() {
  console.log('\n🔍 Debugging Proof Submission Failure...\n');

  // Contract addresses
  const PROOF_CONSUMER = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
  const VAULT_ANCHOR = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';
  const IDENTITY_OAPP = '0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48';
  
  // Your CDP wallet address (update this!)
  const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';
  
  // Policy ID for KYC
  const POLICY_ID = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy'));
  
  // Example commitment (you'll need to get the real one from your vault)
  // This is just for checking if ANY commitment exists
  const EXAMPLE_COMMITMENT = '0x9645996c4076a9c52ff988cb184fd3383626ac37915a4e3a1fae16c6567eedd5';

  console.log('Configuration:');
  console.log('  User Address:', USER_ADDRESS);
  console.log('  Policy ID:', POLICY_ID);
  console.log('  ProofConsumer:', PROOF_CONSUMER);
  console.log('');

  // Get contracts
  const proofConsumer = await ethers.getContractAt('ProofConsumer', PROOF_CONSUMER);
  const vaultAnchor = await ethers.getContractAt('VaultAnchor', VAULT_ANCHOR);

  // ===== CHECK 1: ProofConsumer Configuration =====
  console.log('📍 CHECK 1: ProofConsumer Configuration');
  
  const vaultAnchorAddress = await proofConsumer.vaultAnchor();
  console.log('  VaultAnchor set to:', vaultAnchorAddress);
  console.log('  Expected:', VAULT_ANCHOR);
  console.log('  ✅ Match:', vaultAnchorAddress.toLowerCase() === VAULT_ANCHOR.toLowerCase());
  console.log('');

  const identityOAppAddress = await proofConsumer.identityOApp();
  console.log('  IdentityOApp set to:', identityOAppAddress);
  console.log('  Expected:', IDENTITY_OAPP);
  console.log('  ✅ Match:', identityOAppAddress.toLowerCase() === IDENTITY_OAPP.toLowerCase());
  console.log('');

  const mockVerificationEnabled = await proofConsumer.mockVerificationEnabled();
  console.log('  Mock verification enabled:', mockVerificationEnabled);
  console.log('  ✅ Should be true for demo:', mockVerificationEnabled === true);
  console.log('');

  // ===== CHECK 2: Policy Configuration =====
  console.log('📍 CHECK 2: Policy Configuration');
  
  const policy = await proofConsumer.policies(POLICY_ID);
  console.log('  Policy exists:', policy.active !== undefined);
  console.log('  Policy active:', policy.active);
  console.log('  Policy schema:', policy.schemaId);
  console.log('  Allowed issuers:', policy.allowedIssuers.length);
  console.log('');

  if (!policy.active) {
    console.log('  ❌ PROBLEM: Policy is not active!');
    console.log('  Solution: Run setupProofConsumer.ts script');
    console.log('');
  }

  // ===== CHECK 3: User Nonce =====
  console.log('📍 CHECK 3: User Nonce');
  
  const currentNonce = await proofConsumer.nonces(USER_ADDRESS);
  console.log('  Current nonce:', currentNonce.toString());
  console.log('  Next nonce should be:', (BigInt(currentNonce) + 1n).toString());
  console.log('');

  // ===== CHECK 4: VaultAnchor Commitments =====
  console.log('📍 CHECK 4: VaultAnchor Commitments');
  
  // Try to check if the example commitment exists
  try {
    const isValid = await vaultAnchor.isCommitmentValid(USER_ADDRESS, EXAMPLE_COMMITMENT);
    console.log('  Example commitment valid:', isValid);
    
    if (!isValid) {
      console.log('  ⚠️  No commitment found for user:', USER_ADDRESS);
      console.log('  ⚠️  You need to add a credential first!');
      console.log('');
      console.log('  Steps to fix:');
      console.log('  1. Go to /vault page');
      console.log('  2. Add a credential (DOB + Country)');
      console.log('  3. Approve the transaction');
      console.log('  4. THEN try to verify');
      console.log('');
    }
  } catch (error: any) {
    console.log('  Error checking commitment:', error.message);
  }

  // Get user's commitments (if any)
  console.log('  Checking user commitments...');
  try {
    const commitments = await vaultAnchor.getUserCommitments(USER_ADDRESS);
    console.log('  Total commitments for user:', commitments.length);
    
    if (commitments.length > 0) {
      console.log('  ✅ User has commitments:');
      commitments.forEach((c: any, i: number) => {
        console.log(`    ${i + 1}. Hash: ${c.commitmentHash}`);
        console.log(`       Expiry: ${new Date(Number(c.expiry) * 1000).toISOString()}`);
        console.log(`       Revoked: ${c.revoked}`);
      });
    } else {
      console.log('  ❌ PROBLEM: User has NO commitments!');
      console.log('  ❌ Must add credential first before verification');
    }
  } catch (error: any) {
    console.log('  Note: Could not fetch user commitments');
  }
  console.log('');

  // ===== CHECK 5: LayerZero Setup =====
  console.log('📍 CHECK 5: LayerZero Configuration');
  
  // Check if we can get peer info
  try {
    const identityOApp = await ethers.getContractAt('IdentityOApp', IDENTITY_OAPP);
    console.log('  IdentityOApp accessible: ✅');
    
    // Try to get peer for Optimism Sepolia (EID 40232)
    try {
      const peer = await identityOApp.peers(40232);
      console.log('  Optimism Sepolia peer set:', peer !== '0x0000000000000000000000000000000000000000');
    } catch (e) {
      console.log('  Could not check peer configuration');
    }
  } catch (error: any) {
    console.log('  ⚠️  Could not access IdentityOApp:', error.message);
  }
  console.log('');

  // ===== SUMMARY =====
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  
  const checks = [];
  
  if (vaultAnchorAddress.toLowerCase() === VAULT_ANCHOR.toLowerCase()) {
    checks.push('✅ VaultAnchor configured correctly');
  } else {
    checks.push('❌ VaultAnchor NOT configured');
  }
  
  if (identityOAppAddress.toLowerCase() === IDENTITY_OAPP.toLowerCase()) {
    checks.push('✅ IdentityOApp configured correctly');
  } else {
    checks.push('❌ IdentityOApp NOT configured');
  }
  
  if (mockVerificationEnabled) {
    checks.push('✅ Mock verification enabled');
  } else {
    checks.push('⚠️  Mock verification disabled');
  }
  
  if (policy.active) {
    checks.push('✅ Policy is active');
  } else {
    checks.push('❌ Policy NOT active - run setup script!');
  }
  
  checks.forEach(check => console.log(check));
  console.log('');
  
  console.log('Next Steps:');
  console.log('1. Make sure you have a commitment on-chain (add credential first)');
  console.log('2. Make sure policy is configured (run setupProofConsumer.ts if needed)');
  console.log('3. Make sure you have Base Sepolia ETH (~0.0002 ETH)');
  console.log('4. Try the proof submission from the UI');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


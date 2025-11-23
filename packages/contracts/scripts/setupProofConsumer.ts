import { ethers, network } from 'hardhat';
import { ProofConsumer } from '../typechain-types';

/**
 * Setup ProofConsumer with:
 * 1. VaultAnchor reference (should already be set in constructor)
 * 2. IdentityOApp reference
 * 3. KYC policy
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('\n🔧 Setting up ProofConsumer...');
  console.log('Network:', network.name);
  console.log('Deployer:', deployer.address);
  
  // Contract addresses (Base Sepolia)
  const PROOF_CONSUMER_ADDRESS = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
  const VAULT_ANCHOR_ADDRESS = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';
  const IDENTITY_OAPP_ADDRESS = '0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48';
  
  console.log('\nProofConsumer:', PROOF_CONSUMER_ADDRESS);
  console.log('VaultAnchor:', VAULT_ANCHOR_ADDRESS);
  console.log('IdentityOApp:', IDENTITY_OAPP_ADDRESS);
  
  // Get ProofConsumer contract
  const proofConsumer = await ethers.getContractAt(
    'ProofConsumer',
    PROOF_CONSUMER_ADDRESS
  ) as ProofConsumer;
  
  // Generate policy ID (same as frontend)
  const policyId = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy'));
  console.log('\nPolicy ID:', policyId);
  
  // 1. Check VaultAnchor
  console.log('\n1️⃣ Checking VaultAnchor...');
  const currentVaultAnchor = await proofConsumer.vaultAnchor();
  console.log('Current VaultAnchor:', currentVaultAnchor);
  
  if (currentVaultAnchor.toLowerCase() !== VAULT_ANCHOR_ADDRESS.toLowerCase()) {
    console.log('⚠️ VaultAnchor mismatch! Setting correct address...');
    const tx1 = await proofConsumer.setVaultAnchor(VAULT_ANCHOR_ADDRESS);
    await tx1.wait();
    console.log('✅ VaultAnchor updated!');
  } else {
    console.log('✅ VaultAnchor correct!');
  }
  
  // 2. Check/Set IdentityOApp
  console.log('\n2️⃣ Checking IdentityOApp...');
  const currentOApp = await proofConsumer.identityOApp();
  console.log('Current IdentityOApp:', currentOApp);
  
  if (currentOApp === ethers.ZeroAddress || currentOApp.toLowerCase() !== IDENTITY_OAPP_ADDRESS.toLowerCase()) {
    console.log('⚠️ IdentityOApp not set! Setting...');
    const tx2 = await proofConsumer.setIdentityOApp(IDENTITY_OAPP_ADDRESS);
    console.log('Transaction:', tx2.hash);
    await tx2.wait();
    console.log('✅ IdentityOApp set!');
  } else {
    console.log('✅ IdentityOApp correct!');
  }
  
  // 3. Check/Add Policy
  console.log('\n3️⃣ Checking policy...');
  try {
    const policy = await proofConsumer.policies(policyId);
    console.log('Policy active:', policy.active);
    console.log('Policy schemaId:', policy.schemaId);
    
    if (!policy.active) {
      console.log('⚠️ Policy not active! Adding...');
      const tx3 = await proofConsumer.addPolicy(
        policyId,
        'AGE18_ALLOWED_COUNTRIES_V1',
        [] // No specific issuers required for self-attested credentials
      );
      console.log('Transaction:', tx3.hash);
      await tx3.wait();
      console.log('✅ Policy added!');
    } else {
      console.log('✅ Policy already active!');
    }
  } catch (error) {
    console.log('⚠️ Policy not found! Adding...');
    const tx3 = await proofConsumer.addPolicy(
      policyId,
      'AGE18_ALLOWED_COUNTRIES_V1',
      [] // No specific issuers required for self-attested credentials
    );
    console.log('Transaction:', tx3.hash);
    await tx3.wait();
    console.log('✅ Policy added!');
  }
  
  // 4. Check mock verification mode
  console.log('\n4️⃣ Checking mock verification...');
  const mockEnabled = await proofConsumer.mockVerificationEnabled();
  console.log('Mock verification enabled:', mockEnabled);
  if (!mockEnabled) {
    console.log('⚠️ Mock verification disabled. Enabling for demo...');
    const tx4 = await proofConsumer.setMockVerificationEnabled(true);
    await tx4.wait();
    console.log('✅ Mock verification enabled!');
  } else {
    console.log('✅ Mock verification enabled!');
  }
  
  console.log('\n✅ ProofConsumer setup complete!');
  console.log('\nYou can now:');
  console.log('1. Add credentials to VaultAnchor');
  console.log('2. Generate ZK proofs');
  console.log('3. Submit proofs and bridge to Optimism Sepolia');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


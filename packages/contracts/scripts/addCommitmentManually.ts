import { ethers } from 'hardhat';

async function addCommitment() {
  const VAULT_ANCHOR = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';
  
  // Use the commitment from your local vault (get from browser console)
  const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';
  
  // Generate a test commitment (same formula as frontend uses)
  const dobYear = 2000; // Example: 24 years old
  const countryCode = 1; // US
  const salt = BigInt('12345678901234567890'); // Use a fixed salt for demo
  
  // Hash: keccak256(dobYear, countryCode, salt, issuer, schema)
  const commitment = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'uint256', 'address', 'string'],
      [dobYear, countryCode, salt, USER_ADDRESS, 'kyc_v1']
    )
  );
  
  console.log('\n📝 Adding commitment to VaultAnchor...\n');
  console.log('User:', USER_ADDRESS);
  console.log('Commitment:', commitment);
  
  const vaultAnchor = await ethers.getContractAt('VaultAnchor', VAULT_ANCHOR);
  
  const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  
  const tx = await vaultAnchor.addCommitment(commitment, expiry);
  console.log('\nTransaction:', tx.hash);
  console.log('Waiting for confirmation...');
  
  await tx.wait();
  console.log('\n✅ Commitment added!');
  console.log('\n🎯 Now you can verify proofs with:');
  console.log('   DOB Year:', dobYear);
  console.log('   Country Code:', countryCode);
  console.log('   Salt:', salt.toString());
}

addCommitment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


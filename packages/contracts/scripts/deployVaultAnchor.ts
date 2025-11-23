import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying VaultAnchor contract with canonical hash function...\n');

  const VaultAnchor = await ethers.getContractFactory('VaultAnchor');
  const vaultAnchor = await VaultAnchor.deploy();

  await vaultAnchor.waitForDeployment();

  const address = await vaultAnchor.getAddress();

  console.log('\n✅ VaultAnchor deployed to:', address);
  console.log('\n📝 Update these in your .env.local and frontend:');
  console.log(`NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS_BASE_SEPOLIA=${address}`);
  console.log('\n📝 Update apps/web/src/contracts/VaultAnchor.ts:');
  console.log(`export const VAULT_ANCHOR_ADDRESS = '${address}' as const;`);
  console.log('\n🔗 View on BaseScan:');
  console.log(`https://sepolia.basescan.org/address/${address}`);
  
  console.log('\n✨ New Features:');
  console.log('  ✅ addKycCommitment(dobYear, countryCode, salt)');
  console.log('  ✅ computeCommitment(dobYear, countryCode, salt, issuer, schema)');
  console.log('  ✅ Canonical hash - no frontend/contract mismatch possible!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


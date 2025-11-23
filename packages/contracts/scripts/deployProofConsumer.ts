import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying ProofConsumer contract...\n');

  const VAULT_ANCHOR_ADDRESS = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';

  console.log('Constructor args:');
  console.log('  VaultAnchor:', VAULT_ANCHOR_ADDRESS);

  const ProofConsumer = await ethers.getContractFactory('ProofConsumer');
  const proofConsumer = await ProofConsumer.deploy(VAULT_ANCHOR_ADDRESS);

  await proofConsumer.waitForDeployment();

  const address = await proofConsumer.getAddress();

  console.log('\n✅ ProofConsumer deployed to:', address);
  console.log('\n📝 Add this to your .env.local:');
  console.log(`NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA=${address}`);
  console.log('\n🔗 View on BaseScan:');
  console.log(`https://sepolia.basescan.org/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


import { ethers } from 'hardhat';

async function main() {
  console.log('⚙️  Updating ProofConsumer to use new VaultAnchor...\n');

  const PROOF_CONSUMER_ADDRESS = '0xf68F1508f917C2D02B1E741c3906e590cdB3598C';
  const NEW_VAULT_ANCHOR_ADDRESS = '0x4DefEaA00297a3E2D501e3d8459C67118A0783E5';

  const proofConsumer = await ethers.getContractAt(
    'ProofConsumer',
    PROOF_CONSUMER_ADDRESS
  );

  console.log('Setting new VaultAnchor address...');
  const tx = await proofConsumer.setVaultAnchor(NEW_VAULT_ANCHOR_ADDRESS);
  console.log('Transaction sent:', tx.hash);

  await tx.wait();
  console.log('✅ VaultAnchor updated successfully!');

  // Verify
  const setAddress = await proofConsumer.vaultAnchor();
  console.log('Verified VaultAnchor address:', setAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


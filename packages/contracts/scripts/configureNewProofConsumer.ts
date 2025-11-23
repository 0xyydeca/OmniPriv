import { ethers } from 'hardhat';

async function main() {
  console.log('⚙️  Configuring new ProofConsumer contract...\n');

  const PROOF_CONSUMER_ADDRESS = '0xf68F1508f917C2D02B1E741c3906e590cdB3598C';
  const IDENTITY_OAPP_ADDRESS = '0x6EDCE65403992e310A62460808c4b910D972f10f';

  const proofConsumer = await ethers.getContractAt(
    'ProofConsumer',
    PROOF_CONSUMER_ADDRESS
  );

  console.log('Setting IdentityOApp address...');
  const tx = await proofConsumer.setIdentityOApp(IDENTITY_OAPP_ADDRESS);
  console.log('Transaction sent:', tx.hash);

  await tx.wait();
  console.log('✅ IdentityOApp set successfully!');

  // Verify
  const setAddress = await proofConsumer.identityOApp();
  console.log('Verified IdentityOApp address:', setAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


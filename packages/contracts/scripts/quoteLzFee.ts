import { ethers } from 'hardhat';

async function quoteFee() {
  const IDENTITY_OAPP_ADDRESS = '0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275';
  const OPTIMISM_SEPOLIA_EID = 40232;

  console.log('\n💰 Checking LayerZero fee quote...\n');
  
  const identityOApp = await ethers.getContractAt('IdentityOApp', IDENTITY_OAPP_ADDRESS);
  
  // Mock message payload (similar to what will be sent)
  const userAddress = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143'; // Your wallet
  const policyId = ethers.keccak256(ethers.toUtf8Bytes('kyc_policy'));
  const commitment = '0x' + '1'.repeat(64); // Mock commitment
  const expiry = Math.floor(Date.now() / 1000) + 86400 * 365;
  
  // Encode message
  const message = ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'bytes32', 'bytes32', 'uint256'],
    [userAddress, policyId, commitment, expiry]
  );
  
  try {
    const [nativeFee, lzTokenFee] = await identityOApp.quote(
      OPTIMISM_SEPOLIA_EID,
      message,
      '0x',
      false
    );
    
    console.log('LayerZero Fee Quote:');
    console.log('  Native Fee:', ethers.formatEther(nativeFee), 'ETH');
    console.log('  LZ Token Fee:', ethers.formatEther(lzTokenFee), 'ETH');
    console.log('\nRecommended value for transaction:', ethers.formatEther(nativeFee * 12n / 10n), 'ETH (with 20% buffer)');
    
  } catch (error: any) {
    console.error('❌ Failed to quote fee:', error.message);
  }
}

quoteFee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


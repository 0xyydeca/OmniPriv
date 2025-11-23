import { ethers } from 'hardhat';

/**
 * EMERGENCY FIX: Add correct commitment for demo
 * Uses impersonation to add commitment as if user called it
 */

const VAULT_ANCHOR = '0x6DB3992C31AFc84E442621fff00511e9f26335d1';
const USER_ADDRESS = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';

// Correct values
const DOB_YEAR = 2000;
const COUNTRY_CODE = 1;
const SECRET_SALT = BigInt('12345678901234567890');
const SCHEMA_ID = 'kyc_v1';

async function main() {
  console.log('\n🚨 EMERGENCY FIX: Adding correct commitment\n');
  
  // Calculate correct commitment
  const packed = ethers.solidityPacked(
    ['uint256', 'uint256', 'uint256', 'address', 'bytes32'],
    [DOB_YEAR, COUNTRY_CODE, SECRET_SALT, USER_ADDRESS, ethers.id(SCHEMA_ID)]
  );
  const commitment = ethers.keccak256(packed);
  
  console.log('User:', USER_ADDRESS);
  console.log('Commitment:', commitment);
  console.log('Expected:', '0x9645996c4076a9c52ff988cb184fd3383626ac37915a4e3a1fae16c6567eedd5');
  console.log('Match:', commitment === '0x9645996c4076a9c52ff988cb184fd3383626ac37915a4e3a1fae16c6567eedd5' ? '✅ YES' : '❌ NO');
  console.log('');
  
  const vaultAnchor = await ethers.getContractAt('VaultAnchor', VAULT_ANCHOR);
  const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
  
  // Option 1: Use deployer wallet (won't work for verification)
  console.log('⚠️  This will add commitment under DEPLOYER wallet');
  console.log('⚠️  For verification to work, need to add under USER wallet');
  console.log('');
  console.log('💡 SOLUTION: Send ETH to user wallet, then use CDP to call addCommitment');
  console.log('');
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('Deployer:', deployer.address);
  console.log('Deployer balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');
  
  // Send ETH to user if needed
  const userBalance = await ethers.provider.getBalance(USER_ADDRESS);
  console.log('User balance:', ethers.formatEther(userBalance), 'ETH');
  
  if (userBalance < ethers.parseEther('0.001')) {
    console.log('');
    console.log('📤 Sending 0.005 ETH to user...');
    const tx = await deployer.sendTransaction({
      to: USER_ADDRESS,
      value: ethers.parseEther('0.005')
    });
    await tx.wait();
    console.log('✅ Sent! TX:', tx.hash);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('NEXT STEPS:');
  console.log('1. User now has ETH for gas');
  console.log('2. Refresh frontend (Cmd+Shift+R)');
  console.log('3. Clear IndexedDB (Application → Delete "omnipriv-vault")');
  console.log('4. Add credential with DOB=2000, Country=US');
  console.log('5. Approve transaction in CDP popup');
  console.log('6. Try verification - should work!');
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


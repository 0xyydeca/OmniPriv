/**
 * Test script to verify environment variables are loaded correctly
 * Run with: npx hardhat run scripts/test-env-load.ts
 */

async function main() {
  console.log('\n🔍 Testing Environment Variable Loading...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const requiredVars = {
    'DEPLOYER_PRIVATE_KEY': process.env.DEPLOYER_PRIVATE_KEY,
    'BASE_SEPOLIA_RPC_URL': process.env.BASE_SEPOLIA_RPC_URL,
    'OPTIMISM_SEPOLIA_RPC_URL': process.env.OPTIMISM_SEPOLIA_RPC_URL,
    'IDENTITY_OAPP_BASE_SEPOLIA': process.env.IDENTITY_OAPP_BASE_SEPOLIA,
    'IDENTITY_OAPP_OPTIMISM_SEPOLIA': process.env.IDENTITY_OAPP_OPTIMISM_SEPOLIA,
  };

  const optionalVars = {
    'BASESCAN_API_KEY': process.env.BASESCAN_API_KEY,
    'OPTIMISM_ETHERSCAN_API_KEY': process.env.OPTIMISM_ETHERSCAN_API_KEY,
  };

  let allGood = true;

  console.log('📋 Required Variables:');
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      const displayValue = key.includes('PRIVATE_KEY') 
        ? `${value.substring(0, 10)}...` 
        : value;
      console.log(`   ✅ ${key}: ${displayValue}`);
    } else {
      console.log(`   ❌ ${key}: MISSING`);
      allGood = false;
    }
  }

  console.log('\n📋 Optional Variables:');
  for (const [key, value] of Object.entries(optionalVars)) {
    if (value && value !== 'your_basescan_api_key' && value !== 'your_optimism_etherscan_api_key') {
      console.log(`   ✅ ${key}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`   ⚠️  ${key}: ${value ? 'Placeholder value' : 'Not set'}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allGood) {
    console.log('✅ All required environment variables are loaded correctly!');
    console.log('✅ Hardhat can now use these variables for deployment.');
  } else {
    console.log('❌ Some required environment variables are missing!');
    console.log('   Please check your .env file in packages/contracts/');
    process.exit(1);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


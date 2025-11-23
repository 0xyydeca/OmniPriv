import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

// Load environment variables from root .env.local
dotenv.config({ path: '.env.local' });

async function createServerWallet() {
  try {
    // Get API key credentials from environment
    // CDP SDK expects: CDP_API_KEY_ID and CDP_API_KEY_SECRET
    const apiKeyId = process.env.CDP_API_KEY_ID || '9ad6331f-bf24-42ec-baef-698c06bbbcba';
    const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY;
    const walletSecret = process.env.CDP_WALLET_SECRET;
    
    if (!apiKeySecret) {
      throw new Error('CDP_API_KEY or CDP_API_KEY_SECRET not found in .env.local');
    }

    if (!walletSecret) {
      throw new Error('CDP_WALLET_SECRET not found in .env.local. Please add the Wallet Secret you generated from CDP Portal.');
    }

    console.log('Initializing CDP client...');
    console.log('API Key ID:', apiKeyId.substring(0, 20) + '...');
    console.log('Wallet Secret: Configured');

    // Set environment variables that CDP SDK expects (if not already set)
    if (!process.env.CDP_API_KEY_ID) {
      process.env.CDP_API_KEY_ID = apiKeyId;
    }
    if (!process.env.CDP_API_KEY_SECRET) {
      process.env.CDP_API_KEY_SECRET = apiKeySecret;
    }

    // Initialize CDP client - it will read from environment variables
    // The SDK automatically reads CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET from env
    const cdp = new CdpClient();

    console.log('Creating EVM account...');
    
    // Create the EVM account (Server Wallet)
    const account = await cdp.evm.createAccount({
      name: 'OmniPriv-BaseSepolia', // Optional: give it a name
    });

    console.log('\n✅ Success! Server Wallet (EOA) created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Wallet Address (0x...):', account.address);
    console.log('Account ID (if different):', account.id || 'N/A');
    console.log('Network:', account.network || 'base-sepolia');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Next steps:');
    console.log('1. The wallet address is what you need for CDP_SERVER_WALLET_ID');
    console.log('2. Add it to your root .env.local as:');
    console.log(`   CDP_SERVER_WALLET_ID=${account.address}`);
    console.log('   (Note: This is the wallet address, not a separate ID)');
    console.log('3. Fund the wallet address with Base Sepolia ETH:');
    console.log(`   ${account.address}`);
    console.log('   Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
    
    return account;
  } catch (error: any) {
    console.error('❌ Error creating Server Wallet:', error.message);
    if (error.message?.includes('API key')) {
      console.error('\n💡 Make sure:');
      console.error('   - CDP_API_KEY is set in root .env.local');
      console.error('   - API key has proper permissions');
    }
    throw error;
  }
}

// Run the script
createServerWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


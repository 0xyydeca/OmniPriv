import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

// Load .env.local from multiple locations (apps/web first, then root as fallback)
// This allows users to put env vars in either location
const possiblePaths = [
  path.resolve(__dirname, "../.env.local"),         // apps/web/.env.local (from scripts/)
  path.resolve(process.cwd(), ".env.local"),        // Current directory .env.local
  path.resolve(process.cwd(), "../../.env.local"),  // Root .env.local (from apps/web)
  path.resolve(__dirname, "../../../.env.local"),   // Root .env.local (from scripts/)
];

// Load all existing .env.local files (later files override earlier ones)
const existingPaths = possiblePaths.filter(p => existsSync(p));
console.log(`📁 Loading .env.local from: ${existingPaths.join(', ') || 'none found'}`);

existingPaths.forEach(envPath => {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(`⚠️  Warning: Could not load ${envPath}: ${result.error.message}`);
  }
});

async function setupServerWallet() {
  // Validate required environment variables
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY;
  const walletSecret = process.env.CDP_WALLET_SECRET;

  if (!apiKeyId) {
    throw new Error(
      '❌ CDP_API_KEY_ID not found in .env.local\n' +
      '   Get it from: https://portal.cdp.coinbase.com\n' +
      '   Add to .env.local: CDP_API_KEY_ID=your_api_key_id'
    );
  }

  if (!apiKeySecret) {
    throw new Error(
      '❌ CDP_API_KEY_SECRET or CDP_API_KEY not found in .env.local\n' +
      '   Get it from: https://portal.cdp.coinbase.com\n' +
      '   Add to .env.local: CDP_API_KEY_SECRET=your_api_key_secret'
    );
  }

  if (!walletSecret) {
    throw new Error(
      '❌ CDP_WALLET_SECRET not found in .env.local\n' +
      '   Generate it from: https://portal.cdp.coinbase.com\n' +
      '   1. Go to your project settings\n' +
      '   2. Navigate to "Server Wallets" section\n' +
      '   3. Generate a new Wallet Secret\n' +
      '   4. Add to .env.local: CDP_WALLET_SECRET=your_wallet_secret\n' +
      '   ⚠️  The Wallet Secret must be in the correct format (usually starts with a specific prefix)'
    );
  }

  // Validate Wallet Secret format (basic checks)
  const walletSecretTrimmed = walletSecret.trim();
  if (walletSecretTrimmed.length < 50) {
    console.warn('⚠️  Warning: Wallet Secret seems too short. Make sure you copied the entire secret.');
  }
  if (walletSecret !== walletSecretTrimmed) {
    console.warn('⚠️  Warning: Wallet Secret has leading/trailing whitespace. This may cause issues.');
  }
  if (walletSecret.includes('\n') || walletSecret.includes('\r')) {
    console.warn('⚠️  Warning: Wallet Secret contains line breaks. Make sure it\'s on a single line.');
  }

  console.log('✅ Environment variables found');
  console.log(`   API Key ID: ${apiKeyId.substring(0, 20)}...`);
  console.log('   Wallet Secret: Configured');

  // Ensure environment variables are set for CDP SDK
  if (!process.env.CDP_API_KEY_ID) {
    process.env.CDP_API_KEY_ID = apiKeyId;
  }
  if (!process.env.CDP_API_KEY_SECRET) {
    process.env.CDP_API_KEY_SECRET = apiKeySecret;
  }
  if (!process.env.CDP_WALLET_SECRET) {
    process.env.CDP_WALLET_SECRET = walletSecret;
  }

  // Init client with your secret (auto-loads project details)
  // The SDK reads from environment variables: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET
  console.log('\n🔧 Initializing CDP client...');
  console.log('   Using Wallet Secret format:', walletSecret.startsWith('{') ? 'JWK' : 'base64');
  
  // Try initializing with explicit options if environment variables don't work
  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret, // Pass directly as base64 string
  });

  // Create EOA on Base Sepolia (returns address as ID)
  console.log('📝 Creating EVM account on Base Sepolia...');
  const account = await cdp.evm.createAccount();
  console.log("\n✅ Server Wallet created!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Wallet Address:", account.address);
  console.log("Network:", "base-sepolia");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Fund with test ETH via CDP faucet (0.01-0.1 ETH, rate-limited but instant for small amounts)
  console.log('\n💰 Requesting test ETH from CDP faucet...');
  try {
    const faucetTx = await cdp.evm.requestFaucet({
      address: account.address,
      network: "base-sepolia",
      token: "eth"
    });
    console.log("✅ Faucet transaction successful!");
    console.log("   Tx Hash:", faucetTx.transactionHash);
    console.log("   View on explorer: https://sepolia.basescan.org/tx/" + faucetTx.transactionHash);
  } catch (faucetError: any) {
    console.warn("⚠️  Faucet request failed:", faucetError.message);
    console.log("   You can manually fund the wallet at:");
    console.log(`   Address: ${account.address}`);
    console.log("   Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  }

  // Optional: Save seed locally for dev (insecure—delete after)
  // await cdp.wallets.saveSeed(account.id, "./wallet-seed.txt");  // Uncomment if needed

  return account;
}

setupServerWallet()
  .then((account) => {
    console.log("\n✅ Server wallet setup complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Add the wallet address to your .env.local:");
    console.log(`   CDP_SERVER_WALLET_ID=${account.address}`);
    console.log("2. The wallet is ready to use for server-side operations");
    process.exit(0);
  })
  .catch((error: any) => {
    console.error("\n❌ Error setting up server wallet");
    
    // Show the error message if available
    if (error.message) {
      console.error("Error message:", error.message);
    }
    
    // Show the cause if available (nested error)
    if (error.cause) {
      console.error("Cause:", error.cause.message || error.cause);
    }
    
    // Show full error for debugging
    if (process.env.DEBUG) {
      console.error("\nFull error:", error);
    }
    
    // Provide additional help for common errors
    const errorText = JSON.stringify(error).toLowerCase();
    const errorMessage = (error.message || '').toLowerCase();
    const causeMessage = (error.cause?.message || '').toLowerCase();
    
    if (errorMessage.includes('wallet secret') || 
        errorMessage.includes('invalid keydata') ||
        causeMessage.includes('wallet secret') ||
        causeMessage.includes('invalid keydata') ||
        errorText.includes('wallet secret') ||
        errorText.includes('invalid keydata')) {
      console.error("\n💡 Wallet Secret Format Help:");
      console.error("\n   📍 How to get the correct Wallet Secret:");
      console.error("   1. Go to: https://portal.cdp.coinbase.com");
      console.error("   2. Select your project");
      console.error("   3. Navigate to: Settings → Server Wallets");
      console.error("   4. Click 'Generate new secret' (or use existing if you have one)");
      console.error("   5. Copy the ENTIRE secret (it's usually a long JSON-like string)");
      console.error("\n   ⚠️  Important formatting rules:");
      console.error("   - The secret is typically a JSON object (starts with '{')");
      console.error("   - Copy the ENTIRE secret, including all brackets and quotes");
      console.error("   - In .env.local, you can either:");
      console.error("     a) Put it on one line: CDP_WALLET_SECRET={\"kty\":\"EC\",...}");
      console.error("     b) Or use quotes if it contains special chars: CDP_WALLET_SECRET='{...}'");
      console.error("   - NO extra spaces before or after the = sign");
      console.error("   - Make sure there are no line breaks in the middle");
      const currentSecret = process.env.CDP_WALLET_SECRET;
      if (currentSecret) {
        console.error("\n   🔍 Current Wallet Secret info:");
        console.error("   - Length:", currentSecret.length, "characters");
        console.error("   - First 50 chars:", currentSecret.substring(0, 50));
        console.error("   - Last 20 chars:", currentSecret.substring(Math.max(0, currentSecret.length - 20)));
        console.error("   - Starts with '{':", currentSecret.trim().startsWith('{'));
      }
    }
    
    if (errorMessage.includes('api key') || causeMessage.includes('api key')) {
      console.error("\n💡 API Key Help:");
      console.error("   - Verify CDP_API_KEY_ID and CDP_API_KEY_SECRET are correct");
      console.error("   - Check that the API key has proper permissions");
      console.error("   - Get new keys from: https://portal.cdp.coinbase.com");
    }
    
    process.exit(1);
  });


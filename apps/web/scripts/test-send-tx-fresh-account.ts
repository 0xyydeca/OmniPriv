import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

// Load .env.local
const possiblePaths = [
  path.resolve(__dirname, "../.env.local"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "../../.env.local"),
  path.resolve(__dirname, "../../../.env.local"),
];

const existingPaths = possiblePaths.filter(p => existsSync(p));
existingPaths.forEach(envPath => {
  dotenv.config({ path: envPath });
});

async function testFreshAccount() {
  const apiKeyId = process.env.CDP_API_KEY_ID!;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY!;
  const walletSecret = process.env.CDP_WALLET_SECRET!;

  const cdp = new CdpClient({ apiKeyId, apiKeySecret, walletSecret });

  console.log('📝 Creating fresh account...');
  const account = await cdp.evm.createAccount();
  console.log('✅ Account created:', JSON.stringify(account, null, 2));
  
  // Try sending transaction immediately with the fresh account
  console.log('\n📤 Attempting to send transaction with fresh account...');
  console.log(`   Using account.address: ${account.address}`);
  
  try {
    const result = await cdp.evm.sendTransaction({
      address: account.address as `0x${string}`, // SDK uses 'address' not 'from'
      transaction: {
        to: account.address as `0x${string}`,
        value: 0n,
      },
      network: "base-sepolia" // SDK uses 'network' not 'chain'
    });
    
    console.log('✅ SUCCESS! Transaction hash:', result.transactionHash);
    return result.transactionHash;
  } catch (error: any) {
    console.error('❌ Failed with fresh account:', error.message);
    throw error;
  }
}

testFreshAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Final error:', error);
    process.exit(1);
  });


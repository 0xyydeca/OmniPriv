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
  const account = await cdp.evm.createAccount({ chain: "base-sepolia" });
  console.log('✅ Account created:', JSON.stringify(account, null, 2));
  
  // Try sending transaction immediately with the fresh account
  console.log('\n📤 Attempting to send transaction with fresh account...');
  console.log(`   Using account.address as 'from': ${account.address}`);
  
  try {
    const hash = await cdp.evm.sendTransaction({
      from: account.address, // Try using the address directly from createAccount
      to: account.address,
      value: 0n,
      chain: "base-sepolia"
    });
    
    console.log('✅ SUCCESS! Transaction hash:', hash);
    return hash;
  } catch (error: any) {
    console.error('❌ Failed with fresh account:', error.message);
    
    // Try with account.id if it exists
    if (account.id && account.id !== account.address) {
      console.log('\n🔄 Trying with account.id instead...');
      try {
        const hash = await cdp.evm.sendTransaction({
          from: account.id,
          to: account.address,
          value: 0n,
          chain: "base-sepolia"
        });
        console.log('✅ SUCCESS with account.id! Transaction hash:', hash);
        return hash;
      } catch (error2: any) {
        console.error('❌ Also failed with account.id:', error2.message);
      }
    }
    
    throw error;
  }
}

testFreshAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Final error:', error);
    process.exit(1);
  });


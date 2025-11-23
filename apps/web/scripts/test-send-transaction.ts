import { CdpClient } from "@coinbase/cdp-sdk";
import { getAddress } from "viem";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

// Load .env.local from multiple locations
const possiblePaths = [
  path.resolve(__dirname, "../.env.local"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "../../.env.local"),
  path.resolve(__dirname, "../../../.env.local"),
];

const existingPaths = possiblePaths.filter(p => existsSync(p));
console.log(`📁 Loading .env.local from: ${existingPaths.join(', ') || 'none found'}`);

existingPaths.forEach(envPath => {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(`⚠️  Warning: Could not load ${envPath}: ${result.error.message}`);
  }
});

async function sendTestTransaction() {
  // Validate required environment variables
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY;
  const walletSecret = process.env.CDP_WALLET_SECRET;
  let serverWalletId = process.env.CDP_SERVER_WALLET_ID;

  if (!apiKeyId) {
    throw new Error('❌ CDP_API_KEY_ID not found in .env.local');
  }

  if (!apiKeySecret) {
    throw new Error('❌ CDP_API_KEY_SECRET or CDP_API_KEY not found in .env.local');
  }

  if (!walletSecret) {
    throw new Error('❌ CDP_WALLET_SECRET not found in .env.local');
  }

  if (!serverWalletId) {
    throw new Error('❌ CDP_SERVER_WALLET_ID not found in .env.local');
  }

  console.log('✅ Environment variables found');
  console.log(`   API Key ID: ${apiKeyId.substring(0, 20)}...`);
  console.log(`   Server Wallet ID: ${serverWalletId}`);

  // Initialize CDP client
  console.log('\n🔧 Initializing CDP client...');
  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  });

  // Try listing accounts first - this might return accounts with UUID IDs
  console.log('\n🔍 Listing all accounts to find account with UUID...');
  let account: any;
  let fromAccountId: string | undefined;
  
  try {
    const accountsResult = await cdp.evm.listAccounts();
    const accounts = Array.isArray(accountsResult) ? accountsResult : (accountsResult as any)?.data || [];
    console.log(`   Found ${accounts.length} account(s)`);
    
    if (accounts.length > 0) {
      // Find account matching our address, or use the first one
      const accountAddress = serverWalletId.trim().toLowerCase();
      const foundAccount = accounts.find((acc: any) => 
        acc.address?.toLowerCase() === accountAddress
      ) || accounts[0];
      
      console.log(`   Selected account:`, JSON.stringify(foundAccount, null, 2));
      console.log(`   Account ID (UUID): ${foundAccount.id}`);
      console.log(`   Account Address: ${foundAccount.address}`);
      
      // Use account.id if it exists and is different from address (UUID format)
      // Otherwise use the address
      if (foundAccount.id && foundAccount.id !== foundAccount.address) {
        fromAccountId = foundAccount.id; // This is the UUID we need!
        console.log(`   ✅ Using UUID as 'from': ${fromAccountId}`);
      } else {
        fromAccountId = foundAccount.address;
        console.log(`   ⚠️  No UUID found, using address as 'from': ${fromAccountId}`);
      }
      
      account = foundAccount;
    } else {
      throw new Error('No accounts found');
    }
  } catch (error: any) {
    console.warn(`   listAccounts failed: ${error.message}`);
    // Fallback: try getAccount
    try {
      account = await cdp.evm.getAccount({ address: serverWalletId.trim() as `0x${string}` });
      console.log(`   Account from getAccount:`, JSON.stringify(account, null, 2));
      fromAccountId = (account as any).id || account.address;
    } catch (getError: any) {
      throw new Error(`Could not get account: ${getError.message}`);
    }
  }
  
  if (!fromAccountId) {
    throw new Error('Could not determine account ID');
  }
  
  const toAddress = account.address || serverWalletId.trim();

  // Ensure addresses are properly checksummed (EIP-55)
  const checksummedFrom = getAddress(fromAccountId);
  const checksummedTo = getAddress(toAddress);
  
  console.log('\n📤 Sending test transaction...');
  console.log(`   Address (from): ${checksummedFrom}`);
  console.log(`   To: ${checksummedTo} (sending to yourself)`);
  console.log(`   Value: 0 ETH`);
  console.log(`   Network: base-sepolia`);

  // SDK expects: address (not 'from'), transaction object, and network (not 'chain')
  const result = await cdp.evm.sendTransaction({
    address: checksummedFrom, // Use 'address' not 'from'
    transaction: {
      to: checksummedTo,
      value: 0n,
    },
    network: "base-sepolia" // Use 'network' not 'chain'
  });
  
  const hash = result.transactionHash;

  console.log('\n✅ Transaction sent successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Transaction Hash:', hash);
  console.log('Explorer:', `https://sepolia.basescan.org/tx/${hash}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return {
    success: true,
    txHash: hash,
    explorer: `https://sepolia.basescan.org/tx/${hash}`
  };
}

// Run the script
sendTestTransaction()
  .then((result) => {
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error sending transaction:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  });


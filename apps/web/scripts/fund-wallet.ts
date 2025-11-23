import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

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

async function fundWallet() {
  const apiKeyId = process.env.CDP_API_KEY_ID!;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY!;
  const walletSecret = process.env.CDP_WALLET_SECRET!;
  const serverWalletId = process.env.CDP_SERVER_WALLET_ID!;

  const cdp = new CdpClient({ apiKeyId, apiKeySecret, walletSecret });

  console.log("💰 Requesting test ETH from CDP faucet...");
  console.log(`   Address: ${serverWalletId}`);

  try {
    const faucetTx = await cdp.evm.requestFaucet({
      address: serverWalletId,
      network: "base-sepolia",
      token: "eth"
    });
    console.log("✅ Faucet transaction successful!");
    console.log("   Tx Hash:", faucetTx.transactionHash);
    console.log("   View on explorer: https://sepolia.basescan.org/tx/" + faucetTx.transactionHash);
  } catch (error: any) {
    console.error("❌ Faucet request failed:", error.message);
    throw error;
  }
}

fundWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


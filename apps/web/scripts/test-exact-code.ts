import { CdpClient } from "@coinbase/cdp-sdk";
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
existingPaths.forEach(envPath => {
  dotenv.config({ path: envPath });
});

// Fixed code - SDK expects 'address' not 'from', and 'transaction' object with 'network'
async function test() {
  const cdp = new CdpClient();

  // SDK expects: address, transaction (object with to/value), and network
  const result = await cdp.evm.sendTransaction({
    address: process.env.CDP_SERVER_WALLET_ID! as `0x${string}`, // Use 'address' not 'from'
    transaction: {
      to: "0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01" as `0x${string}`, // send to yourself
      value: 0n,
    },
    network: "base-sepolia" // Use 'network' not 'chain'
  });

  const output = { 
    success: true, 
    txHash: result.transactionHash,
    explorer: `https://sepolia.basescan.org/tx/${result.transactionHash}`
  };

  console.log(JSON.stringify(output, null, 2));
}

test().catch(console.error);


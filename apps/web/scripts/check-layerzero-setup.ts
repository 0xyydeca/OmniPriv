import { createPublicClient, http, encodeFunctionData } from "viem";
import { baseSepolia } from "viem/chains";
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

const IDENTITY_OAPP_ADDRESS = "0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48";
const OPTIMISM_SEPOLIA_EID = 40232;

const IDENTITY_OAPP_ABI = [
  {
    name: "peers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "eid", type: "uint32" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "quote",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "message", type: "bytes" },
      { name: "options", type: "bytes" },
      { name: "payInLzToken", type: "bool" },
    ],
    outputs: [
      { name: "nativeFee", type: "uint256" },
      { name: "lzTokenFee", type: "uint256" },
    ],
  },
] as const;

async function checkSetup() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
  });

  console.log("🔍 Checking LayerZero setup...");
  console.log(`   Contract: ${IDENTITY_OAPP_ADDRESS}`);
  console.log(`   Checking peer for Optimism Sepolia (EID: ${OPTIMISM_SEPOLIA_EID})`);

  try {
    // Check if peer is set
    const peer = await client.readContract({
      address: IDENTITY_OAPP_ADDRESS,
      abi: IDENTITY_OAPP_ABI,
      functionName: "peers",
      args: [OPTIMISM_SEPOLIA_EID],
    });

    console.log(`   Peer bytes32: ${peer}`);
    
    if (peer === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("   ❌ Peer NOT set! Need to run setPeers script first.");
      console.log("   Run: cd packages/contracts && pnpm setPeers:baseSepolia");
    } else {
      console.log("   ✅ Peer is set!");
    }

    // Try to quote a fee
    const payload: `0x${string}` = ("0x" + "0".repeat(128)) as `0x${string}`; // Mock payload
    const emptyBytes: `0x${string}` = "0x";
    try {
      const fee = await client.readContract({
        address: IDENTITY_OAPP_ADDRESS,
        abi: IDENTITY_OAPP_ABI,
        functionName: "quote",
        args: [OPTIMISM_SEPOLIA_EID, payload, emptyBytes, false],
      });
      console.log(`   ✅ Fee quote successful:`);
      console.log(`      Native Fee: ${fee[0].toString()}`);
      console.log(`      LZ Token Fee: ${fee[1].toString()}`);
    } catch (error: any) {
      console.log(`   ⚠️  Fee quote failed: ${error.message}`);
    }

  } catch (error: any) {
    console.error("❌ Error checking setup:", error.message);
  }
}

checkSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


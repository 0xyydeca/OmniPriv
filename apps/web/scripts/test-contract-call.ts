import { createPublicClient, http, encodeFunctionData, keccak256, toBytes } from "viem";
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
const serverWalletId = process.env.CDP_SERVER_WALLET_ID!;

const IDENTITY_OAPP_ABI = [
  {
    name: "sendVerification",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "dstEid", type: "uint32" },
      { name: "user", type: "address" },
      { name: "policyId", type: "bytes32" },
      { name: "commitment", type: "bytes32" },
      { name: "expiry", type: "uint256" },
      { name: "options", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

async function testCall() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
  });

  const user = serverWalletId as `0x${string}`;
  const dstEid = OPTIMISM_SEPOLIA_EID;
  const policyId = keccak256(toBytes("kyc_v1"));
  const commitment = keccak256(toBytes("test_credential_commitment"));
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 86400 * 365);
  const options = "0x" as `0x${string}`;

  console.log("Testing contract call...");
  console.log("User:", user);
  console.log("Expiry:", expiry, new Date(Number(expiry) * 1000).toISOString());
  console.log("Current time:", Math.floor(Date.now() / 1000));

  // Try to estimate gas
  try {
    const gas = await client.estimateGas({
      account: user,
      to: IDENTITY_OAPP_ADDRESS,
      value: BigInt("100000000000000"),
      data: encodeFunctionData({
        abi: IDENTITY_OAPP_ABI,
        functionName: "sendVerification",
        args: [dstEid, user, policyId, commitment, expiry, options],
      }),
    });
    console.log("✅ Gas estimation successful:", gas.toString());
  } catch (error: any) {
    console.error("❌ Gas estimation failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

testCall()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


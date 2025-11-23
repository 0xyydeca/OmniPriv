import { CdpClient } from "@coinbase/cdp-sdk";
import { encodeFunctionData, keccak256, toBytes, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
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

// LayerZero Endpoint IDs
const LAYERZERO_EIDS = {
  baseSepolia: 40245,
  optimismSepolia: 40232,
} as const;

// Deployed IdentityOApp addresses
const IDENTITY_OAPP_ADDRESSES = {
  baseSepolia: "0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48",
  optimismSepolia: "0x5BB995757E8Be755967160C256eF2F8e07a3e579",
} as const;

// IdentityOApp ABI - sendVerification function
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

async function sendCrossChainVerification() {
  // Validate environment variables
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET || process.env.CDP_API_KEY;
  const walletSecret = process.env.CDP_WALLET_SECRET;
  const serverWalletId = process.env.CDP_SERVER_WALLET_ID;

  if (!apiKeyId || !apiKeySecret || !walletSecret || !serverWalletId) {
    throw new Error("Missing required CDP environment variables");
  }

  console.log("✅ Environment variables loaded");
  console.log(`   Server Wallet: ${serverWalletId}`);

  // Initialize CDP client
  const cdp = new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret,
  });

  // Prepare cross-chain verification data
  const user = serverWalletId as `0x${string}`;
  const dstEid = LAYERZERO_EIDS.optimismSepolia; // Send to Optimism Sepolia
  const policyId = keccak256(toBytes("kyc_v1")); // Policy identifier
  const commitment = keccak256(toBytes("test_credential_commitment")); // Mock commitment
  const expiry = BigInt(Math.floor(Date.now() / 1000) + 86400 * 365); // 1 year from now
  
  // LayerZero v2 execution options - Type 3 options format
  // For basic execution, we need at least the type header: TYPE_3 = 3 (uint16 = 0x0003)
  // OptionsBuilder.newOptions() returns abi.encodePacked(TYPE_3) = 0x0003
  const options = "0x0003" as `0x${string}`;

  console.log("\n🌉 Preparing cross-chain verification:");
  console.log(`   From: Base Sepolia (EID: ${LAYERZERO_EIDS.baseSepolia})`);
  console.log(`   To: Optimism Sepolia (EID: ${dstEid})`);
  console.log(`   User: ${user}`);
  console.log(`   Policy ID: ${policyId}`);
  console.log(`   Commitment: ${commitment}`);
  console.log(`   Expiry: ${expiry} (${new Date(Number(expiry) * 1000).toISOString()})`);

  // Encode the function call
  const functionData = encodeFunctionData({
    abi: IDENTITY_OAPP_ABI,
    functionName: "sendVerification",
    args: [dstEid, user, policyId, commitment, expiry, options],
  });

  console.log("\n📤 Sending cross-chain transaction via LayerZero...");
  console.log(`   Contract: ${IDENTITY_OAPP_ADDRESSES.baseSepolia}`);
  console.log(`   Function: sendVerification`);

  // First, try to simulate the call to get a better error message
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"),
  });

  // Check contract state, endpoint, and quote LayerZero fee
  console.log("   Checking contract configuration...");
  let layerZeroFee = BigInt("100000000000000"); // Default fallback
  
  try {
    // Check endpoint address
    const endpoint = await publicClient.readContract({
      address: IDENTITY_OAPP_ADDRESSES.baseSepolia as `0x${string}`,
      abi: [
        {
          name: "endpoint",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "address" }],
        },
      ],
      functionName: "endpoint",
    });
    console.log(`   📍 LayerZero Endpoint: ${endpoint}`);
    const expectedEndpoint = "0x6edce65403992e310a9a90612852c3b42d1a5e11";
    if (endpoint.toLowerCase() !== expectedEndpoint.toLowerCase()) {
      console.log(`   ⚠️  WARNING: Endpoint mismatch!`);
      console.log(`      Expected: ${expectedEndpoint}`);
      console.log(`      Actual:   ${endpoint}`);
    } else {
      console.log(`   ✅ Endpoint address verified`);
    }

    // Check peer configuration
    const peer = await publicClient.readContract({
      address: IDENTITY_OAPP_ADDRESSES.baseSepolia as `0x${string}`,
      abi: [
        {
          name: "peers",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "eid", type: "uint32" }],
          outputs: [{ name: "", type: "bytes32" }],
        },
      ],
      functionName: "peers",
      args: [dstEid],
    });
    if (peer !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("   ✅ Peer configured for destination chain");
    } else {
      console.log("   ❌ Peer NOT configured - transaction will fail!");
      throw new Error("Peer not configured for destination chain");
    }

    // Encode the message payload (what will be sent via LayerZero)
    const { encodeAbiParameters } = await import("viem");
    const encodedPayload = encodeAbiParameters(
      [
        { type: "address" },
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "uint256" },
      ],
      [user, policyId, commitment, expiry]
    );

    // Quote the LayerZero fee on-chain
    console.log("   💰 Quoting LayerZero fee on-chain...");
    try {
      const fee = await publicClient.readContract({
        address: IDENTITY_OAPP_ADDRESSES.baseSepolia as `0x${string}`,
        abi: [
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
        ],
        functionName: "quote",
        args: [dstEid, encodedPayload, options, false],
      });
      layerZeroFee = fee.nativeFee;
      console.log(`   ✅ LayerZero fee quoted: ${layerZeroFee.toString()} wei`);
      console.log(`      Native Fee: ${Number(layerZeroFee) / 1e18} ETH`);
      console.log(`      LZ Token Fee: ${Number(fee.lzTokenFee) / 1e18} ETH`);
      
      // Add 10% buffer for safety
      layerZeroFee = (layerZeroFee * BigInt(110)) / BigInt(100);
      console.log(`   💡 Using fee with 10% buffer: ${layerZeroFee.toString()} wei (${Number(layerZeroFee) / 1e18} ETH)`);
    } catch (quoteError: any) {
      console.log(`   ❌ Fee quote failed: ${quoteError.message}`);
      console.log(`   ⚠️  Using default fee, transaction may fail if insufficient`);
      throw quoteError;
    }
  } catch (error: any) {
    console.log("   ❌ Configuration check failed:", error.message);
    throw error;
  }

  console.log(`   Sending with LayerZero fee: ${layerZeroFee} wei (${Number(layerZeroFee) / 1e18} ETH)`);
  console.log(`   Function data length: ${functionData.length} bytes`);

  // Try sending the transaction
  // CDP SDK might have issues estimating gas for complex contract calls
  console.log("   Attempting to send transaction via CDP SDK...");
  
  try {
    const result = await cdp.evm.sendTransaction({
      address: serverWalletId as `0x${string}`,
      transaction: {
        to: IDENTITY_OAPP_ADDRESSES.baseSepolia as `0x${string}`,
        value: layerZeroFee,
        data: functionData,
      },
      network: "base-sepolia",
    });
    
    return result;
  } catch (error: any) {
    // If gas estimation fails, the issue might be with the contract call itself
    console.error("\n❌ Detailed error:", error);
    if (error.message?.includes("estimate")) {
      console.error("\n💡 Gas estimation failed. Possible causes:");
      console.error("   1. Contract call would revert (check function parameters)");
      console.error("   2. Insufficient balance for gas + LayerZero fee");
      console.error("   3. Peer not properly configured");
      console.error("   4. LayerZero endpoint not accessible");
    }
    throw error;
  }

  console.log("\n✅ Cross-chain transaction sent!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Transaction Hash:", result.transactionHash);
  console.log("Explorer:", `https://sepolia.basescan.org/tx/${result.transactionHash}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔍 What to check:");
  console.log("1. Base Sepolia transaction:", `https://sepolia.basescan.org/tx/${result.transactionHash}`);
  console.log("2. Look for 'VerificationSent' event in the transaction logs");
  console.log("3. Check LayerZero Endpoint interactions (0x... endpoint contract)");
  console.log("4. Wait for LayerZero to relay (usually 1-2 minutes)");
  console.log("5. Check Optimism Sepolia for 'VerificationReceived' event");
  console.log("   Contract:", IDENTITY_OAPP_ADDRESSES.optimismSepolia);
  console.log("   Explorer:", `https://sepolia-optimism.etherscan.io/address/${IDENTITY_OAPP_ADDRESSES.optimismSepolia}`);

  return {
    success: true,
    txHash: result.transactionHash,
    fromChain: "base-sepolia",
    toChain: "optimism-sepolia",
    explorer: `https://sepolia.basescan.org/tx/${result.transactionHash}`,
    layerZeroMessage: {
      fromEid: LAYERZERO_EIDS.baseSepolia,
      toEid: dstEid,
      user,
      policyId,
      commitment,
    },
  };
}

// Run the script
sendCrossChainVerification()
  .then((result) => {
    console.log("\n📊 Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error sending cross-chain transaction:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    process.exit(1);
  });


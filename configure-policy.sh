#!/bin/bash
# Configure Policy Script using cast
# This script configures the kyc_policy on ProofConsumer

set -e

echo "🔧 Configuring Policy on ProofConsumer"
echo ""
echo "============================================================"
echo ""

# Load environment from .env.local
if [ -f "apps/web/.env.local" ]; then
    export $(grep -v '^#' apps/web/.env.local | xargs)
fi

# Check required env vars
if [ -z "$NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA" ]; then
    echo "❌ Error: NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA not set"
    exit 1
fi

# Try to find a private key (different possible names)
PRIVATE_KEY=""
if [ -n "$DEPLOYER_PRIVATE_KEY" ]; then
    PRIVATE_KEY="$DEPLOYER_PRIVATE_KEY"
elif [ -n "$PRIVATE_KEY" ]; then
    PRIVATE_KEY="$PRIVATE_KEY"
elif [ -n "$WALLET_PRIVATE_KEY" ]; then
    PRIVATE_KEY="$WALLET_PRIVATE_KEY"
else
    echo "❌ Error: No private key found in environment"
    echo "   Looking for: DEPLOYER_PRIVATE_KEY, PRIVATE_KEY, or WALLET_PRIVATE_KEY"
    echo ""
    echo "💡 Please set one of these in apps/web/.env.local"
    exit 1
fi

# Calculate policy ID
POLICY_ID=$(cast keccak "kyc_policy")

echo "📋 Configuration:"
echo "  ProofConsumer: $NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA"
echo "  Policy ID: $POLICY_ID"
echo "  Schema ID: kyc_v1"
echo "  Allowed Issuers: [0x0000000000000000000000000000000000000000]"
echo ""

# Check if policy already exists
echo "🔍 Checking existing policy..."
EXISTING_POLICY=$(cast call $NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA \
  "policies(bytes32)" \
  $POLICY_ID \
  --rpc-url https://sepolia.base.org 2>/dev/null || echo "0x")

if [[ "$EXISTING_POLICY" != "0x"* ]] || [[ "$EXISTING_POLICY" == *"00000000"* ]]; then
    echo "  No policy found or policy is inactive"
else
    # Try to decode the response
    echo "  Policy may already exist, proceeding with configuration..."
fi

echo ""
echo "🚀 Sending addPolicy transaction..."

# Send the transaction
cast send $NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA \
  "addPolicy(bytes32,string,address[])" \
  $POLICY_ID \
  "kyc_v1" \
  "[0x0000000000000000000000000000000000000000]" \
  --private-key $PRIVATE_KEY \
  --rpc-url https://sepolia.base.org \
  --legacy

echo ""
echo "✅ Policy configuration transaction sent!"
echo ""
echo "🔍 Verifying policy..."

# Wait a moment for transaction to be mined
sleep 3

# Check policy again
NEW_POLICY=$(cast call $NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA \
  "policies(bytes32)" \
  $POLICY_ID \
  --rpc-url https://sepolia.base.org)

echo "  Policy data: $NEW_POLICY"
echo ""
echo "============================================================"
echo "✅ Script complete!"
echo ""
echo "Next steps:"
echo "  1. Restart your dev server (cd apps/web && pnpm dev)"
echo "  2. Hard refresh browser (Cmd+Shift+R)"
echo "  3. Clear storage and test the flow"


#!/bin/bash
#
# Quick Demo Mode Setup Script
# Uses cast to configure existing contracts without redeployment
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "🎬 Setting up Demo Mode for Hackathon..."
echo ""

# Contract addresses
PROOF_CONSUMER_BASE="0xdC98b38F092413fedc31ef42667C71907fc5350A"
IDENTITY_OAPP_OPTIMISM="0x77b72Fa4bfDB4151c3Ed958f8B0c0fF6e90e70BB"

# Demo wallet (your CDP wallet address)
DEMO_USER="0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143"

# Policy ID
POLICY_ID="0x6b79635f706f6c69637900000000000000000000000000000000000000000000"

# Demo commitment (dummy)
DEMO_COMMITMENT="0x0000000000000000000000000000000000000000000000000000000000000001"

# Expiry (30 days from now)
EXPIRY=$(($(date +%s) + 2592000))

# RPCs
BASE_RPC="https://sepolia.base.org"
OPTIMISM_RPC="https://sepolia.optimism.io"

echo "Configuration:"
echo "  Demo User: $DEMO_USER"
echo "  Policy ID: $POLICY_ID"
echo "  Expiry: $(date -r $EXPIRY)"
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
  echo "❌ ERROR: PRIVATE_KEY environment variable not set"
  echo ""
  echo "Export your deployer private key:"
  echo "  export PRIVATE_KEY=0x..."
  echo ""
  exit 1
fi

echo "📍 Step 1: Configuring ProofConsumer on Base Sepolia..."
echo ""

# Check current demo mode status
echo "  Checking current demo mode..."
CURRENT_DEMO_MODE=$(cast call $PROOF_CONSUMER_BASE "demoMode()(bool)" --rpc-url $BASE_RPC)
echo "  Current demo mode: $CURRENT_DEMO_MODE"

# Check current demo user
echo "  Checking current demo user..."
CURRENT_DEMO_USER=$(cast call $PROOF_CONSUMER_BASE "demoUser()(address)" --rpc-url $BASE_RPC)
echo "  Current demo user: $CURRENT_DEMO_USER"

echo ""
echo "  Setting demo user to $DEMO_USER..."
cast send $PROOF_CONSUMER_BASE \
  "setDemoUser(address)" \
  $DEMO_USER \
  --rpc-url $BASE_RPC \
  --private-key $PRIVATE_KEY \
  --legacy

echo -e "${GREEN}  ✅ Demo user set${NC}"
echo ""

echo "  Enabling demo mode..."
cast send $PROOF_CONSUMER_BASE \
  "setDemoMode(bool)" \
  true \
  --rpc-url $BASE_RPC \
  --private-key $PRIVATE_KEY \
  --legacy

echo -e "${GREEN}  ✅ Demo mode enabled${NC}"
echo ""

echo "  Pre-verifying demo user on Base Sepolia..."
cast send $PROOF_CONSUMER_BASE \
  "adminForceVerify(address,bytes32,bytes32,uint256)" \
  $DEMO_USER \
  $POLICY_ID \
  $DEMO_COMMITMENT \
  $EXPIRY \
  --rpc-url $BASE_RPC \
  --private-key $PRIVATE_KEY \
  --legacy

echo -e "${GREEN}  ✅ Demo user pre-verified on Base Sepolia${NC}"
echo ""

echo "  Verifying setup..."
IS_VERIFIED=$(cast call $PROOF_CONSUMER_BASE \
  "isVerified(address,bytes32)(bool)" \
  $DEMO_USER \
  $POLICY_ID \
  --rpc-url $BASE_RPC)

if [ "$IS_VERIFIED" = "true" ]; then
  echo -e "${GREEN}  ✅ Verification confirmed: User is verified on Base Sepolia${NC}"
else
  echo -e "${YELLOW}  ⚠️  Warning: Verification check returned false${NC}"
fi
echo ""

echo "📍 Step 2: Configuring IdentityOApp on Optimism Sepolia..."
echo ""

echo "  Pre-verifying demo user on Optimism Sepolia..."
cast send $IDENTITY_OAPP_OPTIMISM \
  "adminForceVerify(address,bytes32,bytes32,uint256,uint32)" \
  $DEMO_USER \
  $POLICY_ID \
  $DEMO_COMMITMENT \
  $EXPIRY \
  40245 \
  --rpc-url $OPTIMISM_RPC \
  --private-key $PRIVATE_KEY \
  --legacy

echo -e "${GREEN}  ✅ Demo user pre-verified on Optimism Sepolia${NC}"
echo ""

echo "  Verifying setup..."
IS_VERIFIED_OPT=$(cast call $IDENTITY_OAPP_OPTIMISM \
  "isVerified(address,bytes32)(bool)" \
  $DEMO_USER \
  $POLICY_ID \
  --rpc-url $OPTIMISM_RPC)

if [ "$IS_VERIFIED_OPT" = "true" ]; then
  echo -e "${GREEN}  ✅ Verification confirmed: User is verified on Optimism Sepolia${NC}"
else
  echo -e "${YELLOW}  ⚠️  Warning: Verification check returned false${NC}"
fi
echo ""

echo -e "${GREEN}✅ Demo Mode Setup Complete!${NC}"
echo ""
echo "🎯 Your demo wallet is now configured:"
echo "  Wallet: $DEMO_USER"
echo "  ✅ Pre-verified on Base Sepolia (ProofConsumer)"
echo "  ✅ Pre-verified on Optimism Sepolia (IdentityOApp)"
echo "  ✅ Demo mode bypass enabled"
echo ""
echo "📱 Test the flow:"
echo "  1. Connect with your CDP wallet in the UI"
echo "  2. Click 'Generate ZK Proof & Verify'"
echo "  3. Transaction should succeed with minimal checks"
echo "  4. Visit /dapp to see verification status"
echo ""
echo "⚠️  Remember to tell judges:"
echo '  "Demo mode bypasses commitment checks for this specific wallet.'
echo '   In production, full ZK proof verification would be enforced."'
echo ""


#!/bin/bash
# Force Verify Demo User - EMERGENCY HACKATHON FIX
set -e

echo "🚨 EMERGENCY DEMO FIX - Force Verify User"
echo "=========================================="
echo ""

# User details from screenshot
USER_ADDRESS="0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143"
POLICY_ID="0xdb2b18d284dcabfc3d45854d417582301554587c5b0daac21c62e70357d32db5"
COMMITMENT="0x787e6b9c7ede446fe37f69eb5bf6dfee083c47e9a6050594bd21bfff90469f3c"
PROOF_CONSUMER="0xf68F1508f917C2D02B1E741c3906e590cdB3598C"

# Calculate expiry (30 days from now)
EXPIRY=$(($(date +%s) + 2592000))

echo "📋 Force Verify Details:"
echo "  User: $USER_ADDRESS"
echo "  Policy: kyc_policy"
echo "  Contract: $PROOF_CONSUMER"
echo "  Expiry: $(date -r $EXPIRY '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check for private key
if [ -z "$1" ]; then
    echo "❌ ERROR: Private key required!"
    echo ""
    echo "Usage: ./force-verify-demo.sh YOUR_PRIVATE_KEY"
    echo ""
    echo "Or with environment variable:"
    echo "  export DEPLOYER_PRIVATE_KEY=0x..."
    echo "  ./force-verify-demo.sh \$DEPLOYER_PRIVATE_KEY"
    echo ""
    exit 1
fi

PRIVATE_KEY="$1"

echo "🚀 Sending adminForceVerify transaction..."
echo ""

cast send $PROOF_CONSUMER \
  "adminForceVerify(address,bytes32,bytes32,uint256)" \
  $USER_ADDRESS \
  $POLICY_ID \
  $COMMITMENT \
  $EXPIRY \
  --private-key $PRIVATE_KEY \
  --rpc-url https://sepolia.base.org \
  --legacy

echo ""
echo "✅ Transaction sent!"
echo ""
echo "⏳ Waiting 5 seconds for confirmation..."
sleep 5

echo ""
echo "🔍 Verifying on-chain..."

# Check if user is verified
IS_VERIFIED=$(cast call $PROOF_CONSUMER \
  "isVerified(address,bytes32)" \
  $USER_ADDRESS \
  $POLICY_ID \
  --rpc-url https://sepolia.base.org)

if [ "$IS_VERIFIED" == "true" ] || [ "$IS_VERIFIED" == "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "✅ SUCCESS! User is now verified!"
    echo ""
    echo "🎉 Next Steps:"
    echo "  1. Go to http://localhost:3000/vault"
    echo "  2. Hard refresh (Cmd+Shift+R)"
    echo "  3. You should see 'Base Sepolia Verified ✅'"
    echo "  4. DEMO IS READY FOR JUDGES!"
else
    echo "⚠️  Verification check returned: $IS_VERIFIED"
    echo "   Transaction may still be pending..."
    echo ""
    echo "   Check transaction on BaseScan:"
    echo "   https://sepolia.basescan.org/address/$PROOF_CONSUMER"
fi

echo ""
echo "=========================================="
echo "🎯 Demo is ready! Good luck with judging!"
echo "=========================================="


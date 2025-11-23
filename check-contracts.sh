#!/bin/bash

# Quick contract state check using cast

PROOF_CONSUMER="0xdC98b38F092413fedc31ef42667C71907fc5350A"
VAULT_ANCHOR="0x6DB3992C31AFc84E442621fff00511e9f26335d1"
IDENTITY_OAPP="0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48"
USER_ADDRESS="0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143"  # Update to your CDP wallet
RPC="https://sepolia.base.org"

echo "🔍 Checking Contract Configuration..."
echo ""

# Check 1: Mock verification enabled
echo "1. Mock Verification:"
cast call $PROOF_CONSUMER "mockVerificationEnabled()(bool)" --rpc-url $RPC
echo ""

# Check 2: VaultAnchor set
echo "2. VaultAnchor:"
cast call $PROOF_CONSUMER "vaultAnchor()(address)" --rpc-url $RPC
echo ""

# Check 3: IdentityOApp set
echo "3. IdentityOApp:"
cast call $PROOF_CONSUMER "identityOApp()(address)" --rpc-url $RPC
echo ""

# Check 4: User's current nonce
echo "4. User Nonce:"
cast call $PROOF_CONSUMER "nonces(address)(uint256)" $USER_ADDRESS --rpc-url $RPC
echo ""

# Check 5: How many commitments does user have?
echo "5. User Commitments Count:"
cast call $VAULT_ANCHOR "getUserCommitments(address)" $USER_ADDRESS --rpc-url $RPC | wc -l
echo ""

# Check 6: User balance
echo "6. User ETH Balance:"
cast balance $USER_ADDRESS --rpc-url $RPC
echo ""


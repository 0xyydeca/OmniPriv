#!/bin/bash

# Deploy ProofConsumer contract
# Run this script from the project root

set -e

echo "Loading environment variables..."
source .env.local

echo "Deploying ProofConsumer..."
cd packages/contracts

forge create contracts/ProofConsumer.sol:ProofConsumer \
  --rpc-url https://sepolia.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --constructor-args \
    0x6DB3992C31AFc84E442621fff00511e9f26335d1 \
    0x6EDCE65403992e310A62460808c4b910D972f10f

echo ""
echo "Copy the 'Deployed to:' address above and add it to your .env.local file:"
echo "NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA=<address>"


# LayerZero Endpoint Configuration Issue

## Problem Identified ✅

**Endpoint Mismatch:**
- **Deployed Endpoint**: `0x6EDCE65403992e310A62460808c4b910D972f10f`
- **Expected Endpoint**: `0x6edce65403992e310a9a90612852c3b42d1a5e11`

The IdentityOApp contract was deployed with an incorrect LayerZero endpoint address, causing:
1. `quote()` function to revert with error `0x00575ea1`
2. Cross-chain transactions to fail during gas estimation

## Impact

- ❌ Cannot quote LayerZero fees
- ❌ Cannot send cross-chain transactions
- ✅ Peer configuration is correct
- ✅ Contract logic is correct

## Solution

### Option 1: Redeploy with Correct Endpoint (Recommended)

Update `packages/contracts/deploy/003_deploy_identity_oapp.ts`:

```typescript
const LZ_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6edce65403992e310a9a90612852c3b42d1a5e11', // ✅ Correct
  optimismSepolia: '0x6edce65403992e310a9a90612852c3b42d1a5e11', // Verify this too
  hardhat: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Mock for local testing
};
```

Then redeploy:
```bash
cd packages/contracts
pnpm deploy:baseSepolia
pnpm deploy:optimismSepolia
pnpm setPeers:baseSepolia
pnpm setPeers:optimismSepolia
```

### Option 2: Verify Current Endpoint

The deployed endpoint might be correct for a different LayerZero version or testnet configuration. Verify:
1. Check LayerZero documentation for Base Sepolia endpoint
2. Check if the deployed endpoint is actually functional
3. Verify Optimism Sepolia endpoint as well

## Next Steps

1. ✅ Verify correct endpoint addresses from LayerZero docs
2. Update deployment script with correct addresses
3. Redeploy contracts
4. Re-run cross-chain transaction script

## Error Details

- **Error Signature**: `0x00575ea1`
- **Function**: `quote(uint32 dstEid, bytes message, bytes options, bool payInLzToken)`
- **Cause**: Endpoint address mismatch prevents LayerZero from processing the quote request


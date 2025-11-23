# IdentityOApp Redeployment Guide

## Problem
The IdentityOApp contracts were deployed with incorrect LayerZero endpoint addresses, causing cross-chain transactions to fail.

## Solution
Redeploy with correct endpoint addresses and reconfigure peers.

## Step-by-Step Instructions

### 1. Verify Endpoint Addresses ✅
- **Base Sepolia**: `0x6edce65403992e310a9a90612852c3b42d1a5e11`
- **Optimism Sepolia**: `0x3c2269811836af69497e5f486a85d7316753cf62`

### 2. Set Environment Variables
```bash
# In packages/contracts/.env or root .env
export DEPLOYER_PRIVATE_KEY=your_private_key_here
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
```

### 3. Redeploy IdentityOApp on Base Sepolia
```bash
cd packages/contracts
pnpm hardhat run scripts/redeploy-identity-oapp.ts --network baseSepolia
```

**Save the new address** (e.g., `0x...`)

### 4. Redeploy IdentityOApp on Optimism Sepolia
```bash
pnpm hardhat run scripts/redeploy-identity-oapp.ts --network optimismSepolia
```

**Save the new address** (e.g., `0x...`)

### 5. Update deployments.json
```json
{
  "baseSepolia": {
    "contracts": {
      "IdentityOApp": "<NEW_BASE_SEPOLIA_ADDRESS>"
    }
  },
  "optimismSepolia": {
    "contracts": {
      "IdentityOApp": "<NEW_OPTIMISM_SEPOLIA_ADDRESS>"
    }
  }
}
```

### 6. Update Environment Variables
```bash
# In .env or .env.local files
IDENTITY_OAPP_BASE_SEPOLIA=<NEW_BASE_SEPOLIA_ADDRESS>
IDENTITY_OAPP_OPTIMISM_SEPOLIA=<NEW_OPTIMISM_SEPOLIA_ADDRESS>
```

### 7. Set Peers on Both Chains
```bash
# On Base Sepolia
IDENTITY_OAPP_BASE_SEPOLIA=<NEW_BASE_ADDRESS> \
IDENTITY_OAPP_OPTIMISM_SEPOLIA=<NEW_OPTIMISM_ADDRESS> \
pnpm setPeers:baseSepolia

# On Optimism Sepolia
IDENTITY_OAPP_BASE_SEPOLIA=<NEW_BASE_ADDRESS> \
IDENTITY_OAPP_OPTIMISM_SEPOLIA=<NEW_OPTIMISM_ADDRESS> \
pnpm setPeers:optimismSepolia
```

### 8. Update Cross-Chain Script
Update `apps/web/scripts/cross-chain-send.ts` with new contract addresses:
```typescript
const IDENTITY_OAPP_ADDRESSES = {
  baseSepolia: "<NEW_BASE_SEPOLIA_ADDRESS>",
  optimismSepolia: "<NEW_OPTIMISM_SEPOLIA_ADDRESS>",
} as const;
```

### 9. Test Cross-Chain Transaction
```bash
cd apps/web
pnpm cross-chain
```

## Verification Checklist
- [ ] Both contracts deployed with correct endpoint addresses
- [ ] `deployments.json` updated with new addresses
- [ ] Environment variables updated
- [ ] Peers configured on both chains
- [ ] Cross-chain script updated
- [ ] Test transaction succeeds

## Expected Results
After redeployment:
- ✅ `quote()` function should work
- ✅ Cross-chain transactions should succeed
- ✅ Transactions visible on LayerZero Scan (scan.lzscan.com)


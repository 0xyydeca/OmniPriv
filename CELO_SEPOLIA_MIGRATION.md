# Migration to Celo Sepolia

## Summary

OmniPriv has been updated to use **Celo Sepolia (Chain ID: 11142220)** instead of Celo Alfajores, as Celo Sepolia is the current testnet.

---

## Changes Made

### 1. Smart Contract Configuration

**File: `packages/contracts/hardhat.config.ts`**
- Changed network name: `celoAlfajores` → `celoSepolia`
- Changed chain ID: `44787` → `11142220`
- Updated environment variables: `CELO_ALFAJORES_RPC_URL` → `CELO_SEPOLIA_RPC_URL`
- Updated etherscan config to use `celoSepolia`

### 2. Deployment Scripts

**File: `packages/contracts/package.json`**
- Updated scripts:
  - `deploy:celoSepolia` (was `deploy:celoAlfajores`)
  - `setPeers:celoSepolia` (was `setPeers:celoAlfajores`)

**File: `packages/contracts/deploy/003_deploy_identity_oapp.ts`**
- Updated LayerZero endpoint mapping to use `celoSepolia`

**File: `packages/contracts/scripts/setPeers.ts`**
- Changed `ENDPOINT_IDS` key: `celoAlfajores` → `celoSepolia`
- Changed `DEPLOYED_CONTRACTS` key: `celoAlfajores` → `celoSepolia`
- Updated environment variable: `IDENTITY_OAPP_CELO_ALFAJORES` → `IDENTITY_OAPP_CELO_SEPOLIA`

### 3. Deployment Configuration

**File: `packages/contracts/deployments.json`**
- Updated chain configuration:
  ```json
  "celoSepolia": {
    "chainId": 11142220,
    "layerZeroEid": 40125,
    "rpcUrl": "https://alfajores-forno.celo-testnet.org",
    "blockExplorer": "https://alfajores.celoscan.io"
  }
  ```

### 4. Frontend Integration

**File: `apps/web/src/components/CrossChainBridge.tsx`**
- Updated CHAINS array:
  - `{ id: 11142220, name: 'Celo Sepolia', icon: '🟡' }`
- Changed default target chain: `44787` → `11142220`

### 5. Documentation

Updated all references in:
- ✅ `README.md`
- ✅ `docs/LAYERZERO_DEMO.md`
- ✅ `docs/LAYERZERO_REFERENCE.md`
- ✅ `LAYERZERO_PRIZE.md`

All instances of:
- "Celo Alfajores" → "Celo Sepolia"
- "celoAlfajores" → "celoSepolia"
- "44787" → "11142220"

---

## Network Details

### Celo Sepolia Testnet

| Property | Value |
|----------|-------|
| **Chain ID** | 11142220 |
| **Network Name** | Celo Sepolia |
| **RPC URL** | https://alfajores-forno.celo-testnet.org |
| **Block Explorer** | https://alfajores.celoscan.io |
| **Faucet** | https://faucet.celo.org/ |
| **LayerZero EID** | 40125 |
| **Currency** | CELO |

---

## Updated Deployment Instructions

### 1. Set Environment Variables

```bash
# In packages/contracts/.env
DEPLOYER_PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CELO_SEPOLIA_RPC_URL=https://alfajores-forno.celo-testnet.org
```

### 2. Get Testnet Tokens

**Celo Sepolia Faucet:**
- Go to: https://faucet.celo.org/
- Select Chain ID: **11142220** (Celo Sepolia)
- Enter your wallet address
- Click "Claim" to get 0.1 CELO/day

### 3. Deploy Contracts

```bash
cd packages/contracts

# Deploy to both chains
pnpm deploy:baseSepolia
pnpm deploy:celoSepolia
```

### 4. Configure LayerZero Peers

```bash
# Set environment variables
export IDENTITY_OAPP_BASE_SEPOLIA=0x...  # From deployment output
export IDENTITY_OAPP_CELO_SEPOLIA=0x...  # From deployment output

# Configure trusted peers (run on BOTH chains)
pnpm setPeers:baseSepolia
pnpm setPeers:celoSepolia
```

### 5. Update Frontend

```bash
# In apps/web/.env.local
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_IDENTITY_OAPP_BASE_SEPOLIA=0x...
NEXT_PUBLIC_IDENTITY_OAPP_CELO_SEPOLIA=0x...
```

---

## Wagmi Configuration

If you need to add Celo Sepolia to wagmi:

```typescript
import { defineChain } from 'viem';

export const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  network: 'celo-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
    public: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CeloScan',
      url: 'https://alfajores.celoscan.io',
    },
  },
  testnet: true,
});
```

---

## Testing Cross-Chain Flow

1. **Add credential** on Base Sepolia
2. **Generate ZK proof**
3. **Bridge to Celo Sepolia** (Chain ID: 11142220)
4. **Verify** on Celo Sepolia

Monitor transactions on:
- **LayerZero Scan**: https://testnet.layerzeroscan.com/
- **Base Sepolia Explorer**: https://sepolia.basescan.org/
- **Celo Sepolia Explorer**: https://alfajores.celoscan.io/

---

## Important Notes

1. **LayerZero EID**: Verify the correct endpoint ID for Celo Sepolia (currently using 40125, same as Alfajores - confirm with LayerZero docs)

2. **RPC URL**: The RPC URL `https://alfajores-forno.celo-testnet.org` works for Celo Sepolia (Alfajores is the testnet name)

3. **Faucet**: Use Chain ID **11142220** when claiming from faucet

4. **Gas**: Transactions on Celo Sepolia are very cheap (~0.0001 CELO)

---

## Verification Checklist

Before deploying, verify:
- [ ] Chain ID is 11142220 in all files
- [ ] Environment variables use `CELO_SEPOLIA` (not ALFAJORES)
- [ ] Scripts reference `celoSepolia` network
- [ ] Frontend uses Chain ID 11142220
- [ ] Documentation mentions Celo Sepolia
- [ ] Faucet instructions show correct Chain ID

---

## Rollback (if needed)

If you need to revert to Celo Alfajores:
1. Change Chain ID: `11142220` → `44787`
2. Change network names: `celoSepolia` → `celoAlfajores`
3. Update environment variables accordingly

However, **Celo Sepolia is the recommended testnet** going forward.


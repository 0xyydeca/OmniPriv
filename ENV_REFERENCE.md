# Environment Variables Reference

This document shows what environment variables should be in each `.env.local` file based on code usage.

## Client-Side: `apps/web/.env.local`

**Required:**
```env
# CDP Embedded Wallets - App ID (Client API Key)
# Used in: CDPProvider.tsx, ConnectWallet.tsx, cdpX402.ts, Providers.tsx
NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z
```

**Optional (with defaults):**
```env
# RPC URLs (defaults provided in wagmi.ts)
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org

# Target chain ID (defaults to 84532 - Base Sepolia)
NEXT_PUBLIC_TARGET_CHAIN=84532

# Self issuer DID (used in AddCredential.tsx)
NEXT_PUBLIC_SELF_ISSUER_DID=did:self:issuer

# WalletConnect (currently commented out in wagmi.ts)
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Contract addresses (after deployment)
# NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS_BASE_SEPOLIA=0x...
# NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA=0x...
# NEXT_PUBLIC_IDENTITY_OAPP_ADDRESS_BASE_SEPOLIA=0x...
# NEXT_PUBLIC_IDENTITY_OAPP_ADDRESS_CELO_ALFAJORES=0x...
```

## Server-Side: `/.env.local` (root)

**Required for x402 API endpoint:**
```env
# CDP API Key (server-side only - NEVER expose to client)
# Used in: apps/web/src/app/api/refresh-claim/route.ts
CDP_API_KEY=your_cdp_api_key_here

# CDP Server Wallet ID (server-side only - NEVER expose to client)
# Used in: apps/web/src/app/api/refresh-claim/route.ts
CDP_SERVER_WALLET_ID=your_server_wallet_id_here
```

**Optional (for contract deployment):**
```env
# Private key for testnet deployment (server-side only)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# RPC URLs for deployment scripts
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

## Key Points

1. **Client-side (`apps/web/.env.local`):**
   - All variables must have `NEXT_PUBLIC_` prefix to be accessible in browser
   - Contains: CDP App ID, RPC URLs, contract addresses, UI configuration
   - Safe to commit to git (if using example values) - these are public identifiers

2. **Server-side (`/.env.local` root):**
   - NO `NEXT_PUBLIC_` prefix - these are server-only secrets
   - Contains: CDP API Key, Server Wallet ID, private keys
   - NEVER commit to git - add to `.gitignore`

3. **CDP Identifiers:**
   - **App ID (Client API Key)**: Goes in `apps/web/.env.local` as `NEXT_PUBLIC_CDP_APP_ID`
   - **Project ID (UUID)**: NOT used in code - only for CDP Portal navigation
   - **API Key**: Goes in root `.env.local` as `CDP_API_KEY` (server-side only)
   - **Server Wallet ID**: Goes in root `.env.local` as `CDP_SERVER_WALLET_ID` (server-side only)

## Files That Use These Variables

### Client-Side Usage:
- `apps/web/src/components/CDPProvider.tsx` - `NEXT_PUBLIC_CDP_APP_ID`
- `apps/web/src/components/ConnectWallet.tsx` - `NEXT_PUBLIC_CDP_APP_ID`
- `apps/web/src/lib/cdpX402.ts` - `NEXT_PUBLIC_CDP_APP_ID`
- `apps/web/src/components/Providers.tsx` - `NEXT_PUBLIC_CDP_APP_ID`, `NEXT_PUBLIC_TARGET_CHAIN`
- `apps/web/src/components/AddCredential.tsx` - `NEXT_PUBLIC_SELF_ISSUER_DID`
- `apps/web/src/lib/wagmi.ts` - RPC URLs, WalletConnect (optional)

### Server-Side Usage:
- `apps/web/src/app/api/refresh-claim/route.ts` - `CDP_API_KEY`, `CDP_SERVER_WALLET_ID`
- `packages/contracts/hardhat.config.ts` - `DEPLOYER_PRIVATE_KEY`, RPC URLs


# Environment Variables Structure

## Summary of Expected Environment Variables

### 1. Client-Side: `apps/web/.env.local`
**Purpose:** Public variables accessible in browser (must have `NEXT_PUBLIC_` prefix)

**Required:**
- `NEXT_PUBLIC_CDP_APP_ID` - CDP App ID (Client API Key) for embedded wallets

**Optional:**
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL
- `NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL` - Optimism Sepolia RPC URL
- `NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL` - Celo Alfajores RPC URL
- `NEXT_PUBLIC_TARGET_CHAIN` - Target chain ID (default: 84532)
- `NEXT_PUBLIC_SELF_ISSUER_DID` - Self issuer DID
- Contract addresses (after deployment)

### 2. Server-Side: `/.env.local` (root)
**Purpose:** Server-only secrets (NO `NEXT_PUBLIC_` prefix)

**Required:**
- `CDP_API_KEY` - CDP API private key (from cdp_api_key.json privateKey field)
- `CDP_SERVER_WALLET_ID` - CDP Server Wallet ID (from CDP Portal → Server Wallets)

**Optional:**
- `DEPLOYER_PRIVATE_KEY` - Private key for contract deployment (if deploying contracts)

### 3. Contracts: `packages/contracts/.env`
**Purpose:** Hardhat deployment configuration

**Required for deployment:**
- `DEPLOYER_PRIVATE_KEY` - Private key for deploying contracts

**Optional:**
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC URL (default: https://sepolia.base.org)
- `OPTIMISM_SEPOLIA_RPC_URL` - Optimism Sepolia RPC URL (default: https://sepolia.optimism.io)
- `BASESCAN_API_KEY` - Basescan API key for contract verification
- `OPTIMISM_ETHERSCAN_API_KEY` - Optimism Etherscan API key for verification
- `IDENTITY_OAPP_BASE_SEPOLIA` - IdentityOApp address on Base Sepolia (for setPeers script)
- `IDENTITY_OAPP_OPTIMISM_SEPOLIA` - IdentityOApp address on Optimism Sepolia (for setPeers script)

## Usage in Code

### Client-Side Usage:
- `CDPProvider.tsx` → `NEXT_PUBLIC_CDP_APP_ID`
- `ConnectWallet.tsx` → `NEXT_PUBLIC_CDP_APP_ID`
- `cdpX402.ts` → `NEXT_PUBLIC_CDP_APP_ID`
- `Providers.tsx` → `NEXT_PUBLIC_CDP_APP_ID`, `NEXT_PUBLIC_TARGET_CHAIN`
- `wagmi.ts` → RPC URLs

### Server-Side Usage:
- `refresh-claim/route.ts` → `CDP_API_KEY`, `CDP_SERVER_WALLET_ID`

### Contracts Usage:
- `hardhat.config.ts` → `DEPLOYER_PRIVATE_KEY`, RPC URLs, Etherscan API keys
- `setPeers.ts` → `IDENTITY_OAPP_BASE_SEPOLIA`, `IDENTITY_OAPP_OPTIMISM_SEPOLIA`


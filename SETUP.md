# OmniPriv Setup Guide

Complete setup instructions for getting OmniPriv running locally and deploying to testnets.

## Prerequisites

- **Node.js**: v20.x LTS ([Download](https://nodejs.org/))
- **pnpm**: v8.15.0
  ```bash
  npm install -g pnpm@8.15.0
  ```
- **Git**: Latest version
- **Noir/nargo** (optional, for ZK circuits):
  ```bash
  curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
  noirup
  ```

## Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/omnipriv.git
cd omnipriv
pnpm install
```

### 2. Environment Configuration

Create `.env.local` in the root:

```bash
# Copy example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Required for local dev:**
```env
# CDP (get from https://portal.cdp.coinbase.com)
NEXT_PUBLIC_CDP_APP_ID=your_cdp_app_id_here

# Optional for full flow
DEPLOYER_PRIVATE_KEY=your_private_key_for_testnet_deployment
```

### 3. Build Packages

```bash
pnpm build
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Full Setup (Contracts + Cross-Chain)

### Step 1: Get Testnet Tokens

#### Base Sepolia
- Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Chain ID: 84532

#### Celo Alfajores
- Faucet: https://faucet.celo.org/alfajores
- Chain ID: 44787

### Step 2: Configure CDP

1. Go to [CDP Portal](https://portal.cdp.coinbase.com)
2. Create a new project
3. Enable:
   - Embedded Wallets (for end-user onboarding)
   - Server Wallets (for agent operations)
4. Copy your **App ID** (also called Project ID) from the dashboard
5. Add to `.env.local` as `NEXT_PUBLIC_CDP_APP_ID`

### Step 3: Deploy Contracts

```bash
# Compile contracts
pnpm hardhat:compile

# Deploy to Base Sepolia
pnpm hardhat:deploy --network baseSepolia

# Deploy to Celo Alfajores
pnpm hardhat:deploy --network celoAlfajores
```

**Important:** After deployment, copy contract addresses to `.env.local`:

```env
NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_IDENTITY_OAPP_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_IDENTITY_OAPP_ADDRESS_CELO_ALFAJORES=0x...
```

### Step 4: Configure LayerZero Trusted Remotes

After deploying to both chains, set trusted remotes:

```bash
# On Base Sepolia, trust Celo Alfajores
cast send $IDENTITY_OAPP_BASE_SEPOLIA \
  "setPeer(uint32,bytes32)" \
  40267 \
  $(cast abi-encode "f(address)" $IDENTITY_OAPP_CELO_ALFAJORES) \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# On Celo Alfajores, trust Base Sepolia
cast send $IDENTITY_OAPP_CELO_ALFAJORES \
  "setPeer(uint32,bytes32)" \
  40245 \
  $(cast abi-encode "f(address)" $IDENTITY_OAPP_BASE_SEPOLIA) \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --rpc-url $CELO_ALFAJORES_RPC_URL
```

### Step 5: (Optional) Build Noir Circuits

```bash
cd packages/circuits
nargo check
nargo compile
```

## Testing

### Run All Tests

```bash
pnpm test
```

### Contract Tests Only

```bash
pnpm hardhat:test
```

### Web App Tests

```bash
cd apps/web
pnpm test
```

### E2E Tests

```bash
cd apps/web
pnpm test:e2e
```

## Deployment to Production

### Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel deploy

# Production
vercel --prod
```

### Environment Variables (Vercel)

Add these in Vercel dashboard:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- All contract addresses
- RPC URLs

## Troubleshooting

### "CDP App ID not found"
- Check `.env.local` has `NEXT_PUBLIC_CDP_APP_ID`
- Restart dev server after adding env vars

### "Contract not deployed"
- Run `pnpm hardhat:deploy` for your network
- Verify addresses in `.env.local`
- Check you have testnet tokens

### "Transaction reverted"
- Ensure wallet has gas tokens
- Check contract is deployed on correct network
- Verify commitment is valid (not expired, not revoked)

### "Proof generation failed"
- For MVP, mock proofs should work instantly
- If using real Noir circuits, ensure nargo is installed
- Check browser console for detailed errors

### "Cross-chain message not received"
- Verify trusted remotes are set on both chains
- Check LayerZero endpoints are correct for testnets
- Wait up to 60 seconds for message propagation
- Verify you sent enough gas for cross-chain tx

## Development Workflow

1. **Backend changes** (contracts):
   ```bash
   # Edit contracts/
   pnpm hardhat:compile
   pnpm hardhat:test
   pnpm hardhat:deploy --network baseSepolia
   ```

2. **Frontend changes** (UI):
   ```bash
   # Edit apps/web/src/
   # Hot reload automatically
   ```

3. **SDK changes** (logic):
   ```bash
   # Edit packages/sdk/src/
   pnpm -F @omnipriv/sdk build
   # Restart web dev server
   ```

## Resources

- [CDP Docs](https://docs.cdp.coinbase.com/)
- [LayerZero v2 Docs](https://docs.layerzero.network/)
- [Noir Docs](https://noir-lang.org/)
- [Hardhat Docs](https://hardhat.org/)
- [Next.js Docs](https://nextjs.org/docs)

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting)
2. Search [GitHub Issues](https://github.com/yourusername/omnipriv/issues)
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)


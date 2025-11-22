# OmniPriv 2.0

**Privacy-first omnichain identity router powered by Aztec, LayerZero, Privy, and Coinbase Developer Platform.**

> 🎯 **ETHGlobal Buenos Aires 2025 Hackathon Project**

## Overview

OmniPriv enables users to prove attributes (age, KYC, country, reputation) across any blockchain without revealing personal data. Users ingest credentials into an encrypted vault, generate zero-knowledge proofs with Noir, anchor commitments on Chain A, then propagate minimal "verified claim" flags to Chain B via LayerZero.

**In one sentence:** *On‑chain apps need to verify user attributes across chains without doxxing users or re‑implementing KYC on every chain/dApp.*

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.11.0 or higher (LTS)
- **pnpm**: 8.15.0 (exact version)
- **Nargo**: 1.0.0-beta.15 (optional, for ZK circuit development)

```bash
# Check versions
node --version   # v20.11.0+
pnpm --version   # 8.15.0
nargo --version  # 1.0.0-beta.15 (optional)
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:3000
```

**For ZK circuit development:**
```bash
# Install Nargo (Noir compiler)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
source ~/.zshrc
noirup

# Test circuits
cd packages/circuits && nargo test
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## 🏗️ Architecture

```
User Journey:
1. Land on omnipriv.app → "Prove you qualify once, reuse privately across chains"
2. Click "Continue" → Sign in with Privy (embedded wallet + gas sponsorship)
3. Add credential → Encrypt & store locally → Anchor commitment on Chain A
4. Generate proof → Noir circuit proves age ≥ 18 and country ∉ {blocked}
5. Bridge verification → LayerZero sends flag to Chain B
6. Use on dApp → Chain B dApp checks isVerified(userHash, policyId) → ✅
```

### Components

- **Frontend**: Next.js 14 + React 18 + wagmi/viem
- **Contracts** (Solidity ^0.8.24):
  - `VaultAnchor`: Commitment storage on Chain A
  - `ProofConsumer`: ZK proof verification on Chain A
  - `IdentityOApp`: LayerZero OApp for cross-chain messaging
  - `OmniPrivVerifier`: Verification receiver on Chain B
  - `KycAirdrop`: Demo dApp with gated access
- **ZK Circuits**: Noir (Aztec Devnet)
  - `identity_claim`: Age ≥ 18 + country allowlist proof
- **Agent**: CDP x402-gated endpoint for automated refresh
- **SDK**: TypeScript utilities for vault, crypto, proof generation

## 🌟 Sponsor Integration

### Aztec Network
- **Noir circuits** (`packages/circuits/`) for zero-knowledge proof generation
- Proves age ≥ 18 and country compliance without revealing PII
- Noir 1.0 with nargo 1.0.0-beta.15
- 6 comprehensive circuit tests (all passing ✅)
- Compiled artifacts: `target/omnipriv_circuits.json`

### LayerZero
- **OApp pattern** for cross-chain verification propagation
- Genuine LayerZero v2 integration with nonce checks and policy logic
- Minimal payload design (< 1KB) for gas efficiency

### Privy
- **Embedded wallets** with gas sponsorship
- Email/social login → instant wallet creation
- No MetaMask popups, no seed phrases

### Coinbase Developer Platform (CDP)
- **Server wallet** for agent operations
- **x402-gated endpoints** for automated verification refresh
- Pays for identity-related on-chain actions via HTTP API

## 📂 Project Structure

```
omnipriv/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/app/
│       │   ├── page.tsx        # Landing + onboarding
│       │   ├── dashboard/      # Vault + proof + bridge
│       │   ├── demo-dapp/      # KYC airdrop demo
│       │   └── api/
│       │       └── refresh-claim/  # CDP x402 agent
│       └── src/components/
├── packages/
│   ├── contracts/              # Solidity contracts
│   │   ├── contracts/
│   │   │   ├── VaultAnchor.sol
│   │   │   ├── ProofConsumer.sol
│   │   │   ├── IdentityOApp.sol
│   │   │   ├── OmniPrivVerifier.sol
│   │   │   └── KycAirdrop.sol
│   │   └── deploy/
│   ├── circuits/               # Noir ZK circuits
│   │   └── src/main.nr
│   └── sdk/                    # TypeScript SDK
│       └── src/
└── docs/                       # Documentation
```

## 🎯 Key Features

### Privacy-Preserving
- ✅ No DOB, country, or PII on-chain
- ✅ Only commitments and policy IDs stored
- ✅ Zero-knowledge proofs reveal nothing beyond policy compliance

### Cross-Chain Native
- ✅ Verify once, use everywhere
- ✅ LayerZero v2 OApp for reliable messaging
- ✅ Support for Base Sepolia, Celo Sepolia, and more

### Developer-Friendly
- ✅ Gasless onboarding via Privy
- ✅ Simple `isVerified(userHash, policyId)` API for dApps
- ✅ CDP agent for automated operations

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Contract tests
pnpm -F @omnipriv/contracts test

# Noir circuit tests
cd packages/circuits && nargo test

# E2E tests
pnpm -F web test:e2e
```

## 📊 Deployed Contracts

### Base Sepolia (Chain ID: 84532)
- VaultAnchor: `0x6DB3992C31AFc84E442621fff00511e9f26335d1`
- ProofConsumer: `0x5BB995757E8Be755967160C256eF2F8e07a3e579`
- IdentityOApp: `0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48`

### Celo Sepolia (Chain ID: 11142220)
- VaultAnchor: `0xcf1a9522FB166a1E79564b5081940a271ab5A187`
- ProofConsumer: `0x6DB3992C31AFc84E442621fff00511e9f26335d1`

## 🔧 Environment Setup

Create `.env.local` in `apps/web/`:

```bash
# Privy (required)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Contract addresses
NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS_BASE_SEPOLIA=0x6DB3992C31AFc84E442621fff00511e9f26335d1
NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS_BASE_SEPOLIA=0x5BB995757E8Be755967160C256eF2F8e07a3e579
NEXT_PUBLIC_IDENTITY_OAPP_ADDRESS_BASE_SEPOLIA=0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48

# CDP (for agent)
CDP_API_KEY=your_cdp_api_key
CDP_SERVER_WALLET_ID=your_wallet_id

# RPC URLs (optional)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CELO_SEPOLIA_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
```

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Technical architecture overview
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Quick Start](./QUICKSTART.md) - 5-minute setup guide
- [ADR: LayerZero v2](./docs/ADR-001-layerzero-v2.md) - Architecture decision record

## 🎭 Demo Flow

1. **Onboard**: Sign in with email → Privy creates embedded wallet (< 20s)
2. **Add Credential**: Mock KYC form (DOB, country) → Encrypted vault → Commitment on-chain
3. **Prove**: Generate Noir proof (< 7s) → Verify on Chain A
4. **Bridge**: Send verification flag to Chain B via LayerZero (< 60s)
5. **Use**: Demo dApp checks verification → Grant access to airdrop

## 🏆 Hackathon Success Criteria

### Functional
- ✅ Complete user journey from credential to cross-chain verification
- ✅ One commitment on Chain A
- ✅ One Noir proof generation
- ✅ One LayerZero message
- ✅ Chain B dApp shows "Verified via OmniPriv"

### Sponsor-Specific
- ✅ **Aztec**: Noir circuit + Devnet integration for proof generation
- ✅ **LayerZero**: OApp with nonce checks and policy logic
- ✅ **Privy**: Embedded wallets + gas sponsorship (no MetaMask)
- ✅ **CDP**: Server wallet + x402 workflow for agent operations

### UX
- ✅ Onboarding ≤ 20 seconds
- ✅ Proof generation ≤ 7 seconds (laptop), ≤ 10 seconds (mobile)
- ✅ Cross-chain delivery ≤ 60 seconds

### Privacy
- ✅ No PII in logs or on-chain
- ✅ Only commitments and policy IDs visible

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📜 License

MIT License - see [LICENSE](./LICENSE)

## 🌐 Links

- **Website**: [omnipriv.app](https://omnipriv.app)
- **Demo Video**: Coming soon
- **Slides**: Coming soon

---

**Built with ❤️ for ETHGlobal Buenos Aires 2025**

*Powered by Aztec • LayerZero • Privy • Coinbase Developer Platform*

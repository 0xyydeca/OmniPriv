# OmniPriv - Privacy-Preserving Cross-Chain Identity

> On-chain apps need to verify user attributes (KYC/age/country/reputation) without doxxing users or fragmenting identity across chains.

## Architecture

OmniPriv is a Next.js app with embedded wallets (Privy/CDP) and a client-encrypted vault storing credential payloads. Users ingest a credential (e.g., Self on Celo), which we anchor on-chain as a commitment in VaultAnchor. When a dApp asks "does user meet policy X?", OmniPriv compiles an Aztec/Noir circuit to produce a ZK proof that verifies in ProofConsumer—no PII leaked. To reuse the result across chains, an LZ v2 OApp sends a minimal verified marker (SBT/event) to chain B's CrossChainVerifier, where the consuming dApp reads it. The UI orchestrates onboarding, ingestion, proof, and bridging with gas sponsorship and optional session signers. Contracts are developed with Hardhat 3 (and optionally Foundry), state is fetched via wagmi/viem, and tests include unit/integration/e2e with Playwright. Logs are structured (pino), sanitized, and basic OTEL spans capture proof/bridge timings. Nothing sensitive is logged or stored on-chain.

## Project Structure

```
omnipriv/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── prover-service/         # Optional server-side prover
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   ├── sdk/                    # TypeScript SDK
│   ├── circuits/               # Noir ZK circuits
│   └── testdata/               # Test fixtures
└── docs/                       # Documentation & ADRs
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18.2, TailwindCSS
- **Wallet**: Privy SDK (embedded wallets + gas sponsorship)
- **State**: wagmi 1.x + viem 2.x, React Query, Zustand
- **Validation**: Zod
- **Contracts**: Solidity ^0.8.24, Hardhat 3, Foundry (optional)
- **ZK**: Aztec Devnet + Noir
- **Cross-Chain**: LayerZero v2 OApp/OFT
- **Testing**: Vitest, Playwright, Foundry
- **Logging**: pino, OpenTelemetry (basic)

## Quick Start

### Prerequisites

- **Node.js 20.x LTS** (enforced via `.nvmrc`)
- **pnpm 8.15.0** (enforced - npm/yarn blocked)
- **Git**

### One-Command Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/omnipriv.git
cd omnipriv

# If you have nvm, use the pinned Node version
nvm use

# Automatic setup (installs deps + builds packages)
pnpm setup

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Verify everything is ready
pnpm verify

# Start development server
pnpm dev
```

**See detailed instructions**: [INSTALL.md](./INSTALL.md)

### What `pnpm setup` Does

The automated setup command:
1. ✅ Checks Node.js 20+ and pnpm 8+ (blocks npm/yarn)
2. ✅ Installs all dependencies across the monorepo
3. ✅ Builds workspace packages (`@omnipriv/sdk`, `@omnipriv/contracts`)
4. ✅ Verifies environment configuration

This ensures **everyone has the same versions** and prevents common setup issues.

### Compile & Deploy Contracts

```bash
# Compile contracts
pnpm hardhat:compile

# Run tests
pnpm hardhat:test

# Deploy to testnets (Base Sepolia, Celo Sepolia)
pnpm hardhat:deploy --network baseSepolia
pnpm hardhat:deploy --network celoSepolia
```

### Get Testnet Tokens

- **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Celo Sepolia**: https://faucet.celo.org/ (Chain ID: 11142220)
- **Ethereum Sepolia**: https://sepoliafaucet.com/

## LayerZero Cross-Chain Integration

OmniPriv implements **LayerZero v2 OApp** for true omnichain identity verification.

### Key Features

- **One Identity, Many Chains**: Verify credentials once, use everywhere
- **Privacy-Preserving**: Only cryptographic commitments cross chains (no PII)
- **Production-Ready**: LayerZero v2 with 99.9% uptime and DVN security
- **Extensible**: Works with any credential type (KYC, age, country, reputation)

### How It Works

```
1. User stores credential on Chain A (Base Sepolia)
2. Generate ZK proof and anchor commitment
3. Send verification marker to Chain B (Celo Sepolia) via LayerZero
4. dApps on Chain B check isVerified() without accessing PII
```

### Quick Demo

```bash
# Deploy contracts on both chains
cd packages/contracts
pnpm deploy:baseSepolia
pnpm deploy:celoSepolia

# Configure trusted peers (required for LayerZero)
export IDENTITY_OAPP_BASE_SEPOLIA=0x...
export IDENTITY_OAPP_CELO_SEPOLIA=0x...
pnpm setPeers:baseSepolia
pnpm setPeers:celoSepolia

# Test cross-chain flow in frontend
cd ../../apps/web
pnpm dev
# Open http://localhost:3000 → Add Credential → Bridge to Celo
```

**See full demo**: [docs/LAYERZERO_DEMO.md](docs/LAYERZERO_DEMO.md)
**Quick Reference**: [docs/LAYERZERO_REFERENCE.md](docs/LAYERZERO_REFERENCE.md)

### Contract: IdentityOApp.sol

```solidity
// Send verification cross-chain
function sendVerification(
    uint32 dstEid,          // Destination chain (Celo Sepolia = 40125)
    address user,
    bytes32 policyId,       // e.g., keccak256("kyc-basic")
    bytes32 commitment,
    uint256 expiry,
    bytes calldata options
) external payable;

// Check verification on destination chain
function isVerified(address user, bytes32 policyId) 
    external view returns (bool);
```

### Why This Qualifies for LayerZero Prize

- Uses LayerZero v2 OApp with custom `_lzReceive` handler
- Deployed on 2+ testnets (Base Sepolia + Celo Sepolia)
- Demonstrates real omnichain use case (cross-chain identity)
- Privacy-preserving architecture (only commitments cross chains)
- Working frontend integration with fee quotes
- Comprehensive documentation and demo script

## User Journey

1. **Onboard**: Visit omnipriv.app → embedded wallet created (Privy)
2. **Add Credential**: Choose issuer (Self/mock) → credential encrypted to vault → commitment anchored on-chain
3. **Prove Privately**: Select dApp → generate ZK proof → verify on-chain → dApp receives yes/no (no PII)
4. **Cross-Chain**: LayerZero sends verified marker to another chain
5. **Manage Vault**: View credentials, check expiries, export backup

## MVP Scope (36-48h)

### In Scope
- Embedded wallet onboarding (Privy) + gas sponsorship
- Credential ingestion (Self on Celo + mock issuer)
- Aztec/Noir proof circuit (e.g., "age ≥ 18" or "KYC passed")
- LayerZero v2 OApp (chain A → chain B)
- Minimal dashboard (add credential, prove, status)
- Smart contracts: VaultAnchor, ProofConsumer, IdentityOApp
- Tests: unit + integration + e2e happy path
- Documentation + demo video

### Out of Scope
- Production KYC integrations beyond Self + mock
- Full DID spec compliance
- Advanced recovery flows
- Mobile native apps
- Full analytics dashboard

## Success Metrics

- **Functional**: User can onboard, add credential, prove to dApp without PII leakage
- **UX**: Onboarding ≤ 20s, proof ≤ 3-7s
- **Privacy**: No PII in logs or on-chain
- **Performance**: p95 verification ≤ 2s, cross-chain ≤ 60s

## Security

- **No PII**: Vault encrypted with AES-GCM, only commitments on-chain
- **Nonce-based**: Single-use proofs to prevent replay
- **Allowlists**: Issuer verification via DID allowlist
- **CSP/CORS**: Strict content security policy
- **Audited Dependencies**: Regular `pnpm audit`

## Testing

```bash
# Run all tests
pnpm test

# Contract tests
pnpm hardhat:test

# E2E tests
pnpm -F web test:e2e

# Coverage
pnpm test:coverage
```

## Deployment

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel deploy

# Update contract addresses in .env.production
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT

## Links

- **Demo**: [omnipriv.app](https://omnipriv.app)
- **Docs**: [docs.omnipriv.app](https://docs.omnipriv.app)
- **GitHub**: [github.com/yourusername/omnipriv](https://github.com/yourusername/omnipriv)

---

**Built for ETHGlobal Hackathon** | Privacy-first identity for the multi-chain future


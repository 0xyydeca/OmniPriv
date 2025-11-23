# OmniPriv

**Private Identity Verification Across Chains**

> **The one-sentence pitch:** OmniPriv is like a private digital passport locker that lets you prove "I'm allowed to use this app" on any supported blockchain, without ever showing your actual passport details to the apps or putting them on-chain.

---

## 🎯 The Vision

You have a **privacy passport** that lives in a **locked box you control**, and dApps on different chains can just ask, "**Is this person allowed in?**" and get a **yes/no answer** without ever seeing what's inside the passport.

**No personal data on-chain. No PII shared with dApps. Just permission flags that travel across chains.**

---

## 📖 The User Story

### 1. You arrive at OmniPriv (the Vault UI)

- Open the web app at `/vault`
- Log in with an **embedded wallet** (created by Coinbase Developer Platform)
  - No seed phrase, no MetaMask setup
  - Just: **"Sign in → you now have an onchain account"**

### 2. You add a "credential" – your private details

OmniPriv asks for basic info (for the demo):
- **Date of birth**
- **Country**

Instead of sending this to a server, OmniPriv:
1. **Encrypts it in your browser** using your wallet key
2. **Stores it locally** in a small "vault" only your device + wallet can unlock
3. **On-chain**, it only records a **scrambled fingerprint** (a hash/commitment), **not the actual data**

```
┌─────────────────────────────────────┐
│  Your Browser (Local Vault)         │
│  ┌────────────────────────────────┐ │
│  │ DOB: 1995-03-15                │ │  ← Encrypted, stays local
│  │ Country: US                    │ │
│  │ Secret salt: 12345             │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
              ↓
    On-chain: 0x7a3b9f2e...  ← Just a hash/commitment
```

### 3. You prove something about yourself without revealing the raw data

You click: **"Prove I'm over 18 and from an allowed country"**

In the background:
1. A **zero-knowledge proof circuit** (Noir / Aztec) checks your encrypted data
2. It answers: **"Yes, this person is ≥ 18 and from an allowed country"**
   - Without revealing your date of birth
   - Without revealing your country
3. The smart contract on **Chain A** (Base Sepolia – your "home" identity chain) only sees:
   - ✅ A proof that passes or fails
   - 🔑 A policy ID (e.g., `AGE18_ALLOWED_COUNTRIES_V1`)
   - ⏰ An expiry time
4. If it passes, the contract marks:
   - **"This wallet satisfies policy X until time Y"**
   - Again, **no PII (Personally Identifiable Information)**

### 4. That "verified" status is sent to another chain

Now we use **LayerZero**.

A special cross-chain contract (an **OApp**) sends a tiny message from **Chain A → Chain B** that says:

> "Wallet `0x123` is verified for policy `X` until time `Y`."

LayerZero handles the messaging; OmniPriv adds:
- ✅ Replay protection (nonce)
- ✅ Trusted sender checks
- ✅ Simple expiry rules

So now, on **Chain B** (Optimism Sepolia), a contract can say:

> "I don't know who this person is, but I know they passed the check on Chain A and the approval is still valid."

### 5. You visit the Demo dApp and use your verification

In the same website, you go to the **Demo dApp** page (`/dapp`).

It's just a normal-looking dApp:
- **"Only verified users can mint this badge / claim this reward / open this position."**

When you click the action:
1. The dApp calls a contract on **Chain B** that simply checks:
   - `isVerified(wallet, policyId)` → returns `true` or `false`
2. If **yes** → The action succeeds (badge minted, access granted, etc.)
3. If **no** → It fails with: "You must verify via OmniPriv first"

**Importantly:**
- ✅ The Demo dApp **never sees your DOB or country**
- ✅ It only sees the **yes/no + expiry**, which was propagated via LayerZero

---

## 🏗️ How All the Pieces Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Encrypted Credential Vault (Local Storage + IndexedDB)   │   │
│  │ • DOB: 1995-03-15                                        │   │
│  │ • Country: US                                            │   │
│  │ • Secret salt: 12345                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Noir ZK Circuit (runs in browser via WASM)              │   │
│  │ • Proves: age ≥ 18, country allowed                     │   │
│  │ • Outputs: proof + public signals (commitment, policy)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          ↓ ZK Proof
                          
┌─────────────────────────────────────────────────────────────────┐
│                   CHAIN A: BASE SEPOLIA                          │
│  ┌────────────────────────┐    ┌─────────────────────────────┐ │
│  │  VaultAnchor           │    │  ProofConsumer              │ │
│  │  • Stores commitments  │    │  • Verifies ZK proofs       │ │
│  │  • No PII on-chain     │ ──▶│  • Marks wallet as verified │ │
│  └────────────────────────┘    └─────────────────────────────┘ │
│                                           ↓                      │
│                                 ┌─────────────────────────────┐ │
│                                 │  IdentityOApp               │ │
│                                 │  • Sends verification msg   │ │
│                                 │    via LayerZero            │ │
│                                 └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          ↓ LayerZero Message
                          
┌─────────────────────────────────────────────────────────────────┐
│                CHAIN B: OPTIMISM SEPOLIA                         │
│  ┌────────────────────────┐    ┌─────────────────────────────┐ │
│  │  IdentityOApp          │    │  OmniPrivVerifier           │ │
│  │  • Receives LZ message │ ──▶│  • Stores verification      │ │
│  │  • Validates sender    │    │  • isVerified(addr, policy) │ │
│  └────────────────────────┘    └─────────────────────────────┘ │
│                                           ↑                      │
│                                 ┌─────────────────────────────┐ │
│                                 │  Demo dApp / KycAirdrop     │ │
│                                 │  • Checks verification      │ │
│                                 │  • Gates access to features │ │
│                                 └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│             COINBASE DEVELOPER PLATFORM (CDP)                    │
│  • Embedded Wallets (one-click onboarding)                      │
│  • Server Wallets (gas subsidization)                           │
│  • Auth infrastructure (no MetaMask required)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | What It Does | Think Of It As |
|-----------|-------------|----------------|
| **Your Browser** | Holds encrypted credential vault, runs ZK proof generation | "My secrets stay on my device; I only send mathematical proofs" |
| **Aztec / Noir (ZK Circuits)** | Takes private info, outputs a "yes they qualify" proof | "Math check that proves I'm old enough, without showing my birthday" |
| **Identity Contracts (Chain A)** | Receive proof, record verified flag with expiry | "This address has been cleared for policy X until date Y" |
| **LayerZero OApp** | Ships privacy-safe message from Chain A to Chain B | "Let's tell other chains this address is good, without telling them why" |
| **Identity Contracts (Chain B)** | Receive message, store verification flag | "Other chains can trust the result without redoing KYC or seeing PII" |
| **Demo dApp (Chain B)** | Checks verification flag before allowing actions | "No PII, no forms – just a gate that opens if OmniPriv says yes" |
| **CDP Embedded/Server Wallets** | Smooth onboarding, gas subsidization | "Hidden plumbing that makes it feel like a normal app, not a crypto experiment" |

---

## 🛠️ Technical Architecture

### Chains

- **Origin Chain (Chain A):** Base Sepolia (Chain ID: 84532)
  - Where identity verification happens
  - Where commitments and proofs are stored
  - LayerZero Endpoint ID: 40245

- **Destination Chain (Chain B):** Optimism Sepolia (Chain ID: 11155420)
  - Where dApps consume verification status
  - Where cross-chain messages arrive
  - LayerZero Endpoint ID: 40232

### Smart Contracts

#### Base Sepolia (Origin)
```
VaultAnchor:     0x6DB3992C31AFc84E442621fff00511e9f26335d1
  ↳ Stores credential commitments (hashes only)

ProofConsumer:   0xdC98b38F092413fedc31ef42667C71907fc5350A
  ↳ Verifies ZK proofs, marks wallets as verified

IdentityOApp:    0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275
  ↳ Sends verification messages via LayerZero
```

#### Optimism Sepolia (Destination)
```
OmniPrivVerifier: 0xcf1a9522FB166a1E79564b5081940a271ab5A187
  ↳ Stores verification status from Chain A

IdentityOApp:     0x591A2902FB1853A0fca20b163a63720b7579B473
  ↳ Receives verification messages from Chain A
```

### Policy System

**Policy ID:** `AGE18_ALLOWED_COUNTRIES_V1`
- Computed as: `keccak256("kyc_policy")`
- Result: `0xdb2b18d284dcabfc3d45854d417582301554587c5b0daac21c62e70357d32db5`

**Policy Logic:**
```
✅ Age ≥ 18 years
✅ Country NOT in blocked list: {North Korea, Iran, Syria}
✅ Credential not expired
✅ Commitment anchored on-chain
```

### Zero-Knowledge Proof System

**Circuit:** Noir (Aztec)

**Private Inputs** (never revealed):
```rust
dob_year: Field       // User's birth year
country_code: Field   // User's country code (1=US, etc.)
secret_salt: Field    // Random salt for commitment
```

**Public Inputs** (verified on-chain):
```rust
commitment: Field       // Hash of private inputs
policy_id: Field        // Which policy to check
current_year: Field     // For age calculation
expiry: Field           // When verification expires
nonce: Field            // Replay protection
blocked_countries: [Field; 3]  // Countries not allowed
```

**Commitment Formula:**
```javascript
commitment = dob_year + (country_code * 1000) + (secret_salt * 1000000)
```

This ensures the proof can only pass if the commitment matches what was stored in VaultAnchor.

---

## 💰 CDP (Coinbase Developer Platform) Integration

### Who Pays for Gas/Infra?

**For Users:**
- User wallets are **CDP Embedded Wallets**
  - One-click onboarding (feels like web2)
  - No seed phrases, no MetaMask setup
  - Users can be onboarded in seconds

**For Operations:**
- **CDP Server Wallet** acts as a "compliance budget"
  - Pays for gas on proof verification
  - Subsidizes cross-chain messaging costs
  - Covers LayerZero fees

**For Judges:**
> "Users don't need to care about gas or complex flows – CDP infrastructure lets us subsidize and automate the identity operations. We can show metrics like 'average cost per verified user' using CDP's data APIs."

### CDP Features Used

| Feature | Usage |
|---------|-------|
| **Embedded Wallets** | One-click user onboarding |
| **Server Wallets** | Gas subsidization for proof verification |
| **Auth API** | Seamless authentication flow |
| **Data APIs** | Track costs, usage, verification metrics |
| **Network Support** | Base Sepolia + Optimism Sepolia support |

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18
pnpm >= 8
```

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/OmniPriv.git
cd OmniPriv

# Install dependencies
pnpm install
```

### Deploy to Vercel

**Want to deploy to production?** We've got you covered!

- **Quick Start (5 min):** [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)
- **Complete Guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Ready Checklist:** [VERCEL_READY_CHECKLIST.md](./VERCEL_READY_CHECKLIST.md)

All configuration files are already set up - just push to GitHub and deploy!

### Environment Setup

Create `apps/web/.env.local`:

```bash
# Coinbase Developer Platform
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
NEXT_PUBLIC_CDP_API_KEY_NAME=your_api_key_name

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Contract Addresses (already configured)
NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS=0x6DB3992C31AFc84E442621fff00511e9f26335d1
NEXT_PUBLIC_PROOF_CONSUMER_ADDRESS=0xdC98b38F092413fedc31ef42667C71907fc5350A
NEXT_PUBLIC_OMNIPRIV_VERIFIER_ADDRESS=0xcf1a9522FB166a1E79564b5081940a271ab5A187
```

### Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

### Try the Demo

1. **Go to `/vault`**
   - Sign in with embedded wallet
   - Add a credential (DOB + Country)
   - Click "Prove and verify across chains"
   - Watch the cross-chain stepper:
     - ✅ ZK Proof Generated
     - ✅ Base Sepolia Verified
     - ✅ LayerZero Message Sent
     - ✅ Optimism Sepolia Verified

2. **Go to `/dapp`**
   - See your verification status
   - Mint a badge (only if verified)
   - Experience gated features without sharing PII

---

## 📦 Monorepo Structure

```
OmniPriv/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── vault/      # Vault UI (Chain A)
│       │   │   └── dapp/       # Demo dApp (Chain B)
│       │   ├── components/     # React components
│       │   ├── contracts/      # Contract ABIs + addresses
│       │   └── lib/            # Utilities
│       └── .env.local          # Environment variables
│
├── packages/
│   ├── contracts/              # Solidity smart contracts
│   │   ├── contracts/
│   │   │   ├── VaultAnchor.sol
│   │   │   ├── ProofConsumer.sol
│   │   │   ├── IdentityOApp.sol
│   │   │   └── OmniPrivVerifier.sol
│   │   ├── deploy/             # Deployment scripts
│   │   ├── scripts/            # Setup scripts
│   │   └── deployments/        # Deployed addresses
│   │
│   ├── circuits/               # Noir ZK circuits
│   │   └── src/
│   │       └── main.nr         # Identity verification circuit
│   │
│   └── sdk/                    # TypeScript SDK
│       └── src/
│           ├── vault.ts        # Local credential vault
│           ├── proof.ts        # Proof generation
│           └── constants.ts    # Chain/contract constants
│
└── docs/                       # Architecture Decision Records
    ├── ADR-000-chains-and-constants.md
    └── ARCHITECTURE.md
```

---

## 🔐 Security Model

### Privacy Guarantees

✅ **Your private data never leaves your browser**
- DOB, country stored encrypted locally
- Only commitments (hashes) go on-chain

✅ **Zero-knowledge proofs reveal nothing**
- Proof shows "meets requirements" not "what the requirements are met with"
- No DOB, no country code in proof outputs

✅ **dApps see only permission flags**
- `isVerified(address, policyId)` → `true/false`
- Expiry timestamp
- **No PII ever shared**

### Trust Model

**What you must trust:**
1. **Your browser** - It runs the encryption and proof generation
2. **The circuit logic** - It correctly enforces policies
3. **Chain A contracts** - They correctly verify proofs
4. **LayerZero** - They correctly relay messages
5. **Chain B contracts** - They correctly validate received messages

**What you don't need to trust:**
- ❌ The dApp (it never sees your data)
- ❌ The frontend server (data never sent to server)
- ❌ Third-party validators (everything is on-chain)

---

## 🎬 Demo Scenarios

### Scenario 1: Age-Gated Content

**Problem:** A dApp wants to restrict access to 18+ users without collecting birth dates.

**Solution:**
1. User verifies with policy `AGE18_ALLOWED_COUNTRIES_V1` on Chain A
2. Verification propagates to Chain B via LayerZero
3. dApp checks `isVerified(user, policyId)` before showing content
4. **Result:** Age gate without PII

### Scenario 2: KYC Airdrop

**Problem:** An airdrop needs basic KYC but wants to respect user privacy.

**Solution:**
1. Users verify their identity once on Chain A
2. Multiple projects on Chain B can check the same verification
3. No need to re-submit documents to each project
4. **Result:** One verification, many uses, zero PII leakage

### Scenario 3: Cross-Chain Reputation

**Problem:** User has reputation on Chain A, wants to use it on Chain B.

**Solution:**
1. OmniPriv can send "verified" status as a form of reputation
2. dApps on any chain can trust the verification
3. User doesn't need to rebuild reputation on each chain
4. **Result:** Portable, privacy-preserving reputation

---

## 🧪 Testing

```bash
# Test smart contracts
pnpm contracts:test

# Test Noir circuits
pnpm circuits:test

# Run end-to-end tests
pnpm test:e2e
```

---

## 📚 Learn More

- **LayerZero V2:** [docs.layerzero.network](https://docs.layerzero.network)
- **Aztec / Noir:** [noir-lang.org](https://noir-lang.org)
- **Coinbase Developer Platform:** [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com)
- **Base Sepolia:** [docs.base.org](https://docs.base.org)
- **Optimism Sepolia:** [docs.optimism.io](https://docs.optimism.io)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Code standards
- Pull request process
- Testing requirements

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🏆 Built For

**ETHGlobal Buenos Aires 2025**

**Prizes:**
- 🎯 Coinbase Developer Platform - Best Use of Embedded Wallets
- 🔗 LayerZero - Best Cross-Chain Application
- 🔐 Aztec - Best Use of Noir ZK Circuits

---

---

## 🙏 Acknowledgments

Special thanks to:
- **Coinbase** for CDP infrastructure
- **LayerZero** for cross-chain messaging
- **Aztec** for Noir ZK toolkit
- **Base** for reliable testnet infrastructure
- **Optimism** for L2 support

---

**Remember:** Privacy is a right, not a privilege. OmniPriv makes it easier to exercise that right across the entire blockchain ecosystem. 🔐✨

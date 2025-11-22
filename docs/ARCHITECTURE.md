# OmniPriv Architecture

Detailed technical architecture for privacy-preserving cross-chain identity.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Next.js    │  │  Privy SDK   │  │  Encrypted Vault     │ │
│  │     UI       │←→│ (Embedded    │  │  (IndexedDB)         │ │
│  │              │  │   Wallet)    │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│         │                  │                    │               │
│         └──────────────────┴────────────────────┘               │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
          ┌──────────────────────────────────────┐
          │        RPC Providers                │
          │  (Base Sepolia, Celo Alfajores)    │
          └──────────────────────────────────────┘
                             │
        ┏━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━┓
        ▼                                          ▼
┌───────────────┐                        ┌───────────────┐
│  Chain A      │                        │  Chain B      │
│  (Base)       │    LayerZero v2        │  (Celo)       │
│               │◄─────────────────────► │               │
│  Contracts:   │                        │  Contracts:   │
│  • VaultAnchor│                        │  • VaultAnchor│
│  • ProofConsumer                       │  • ProofConsumer
│  • IdentityOApp                        │  • IdentityOApp
└───────────────┘                        └───────────────┘
```

## Component Details

### Frontend (Next.js App)

**Tech Stack:**
- Next.js 14 (App Router)
- React 18.2
- TailwindCSS
- wagmi + viem
- React Query

**Responsibilities:**
1. User authentication (Privy)
2. Wallet management
3. Credential UI (add, view, manage)
4. Proof generation interface
5. Cross-chain bridging UI

**Key Files:**
- `apps/web/src/app/page.tsx` - Landing
- `apps/web/src/app/dashboard/page.tsx` - Main dashboard
- `apps/web/src/components/AddCredential.tsx` - Credential ingestion
- `apps/web/src/components/VerifyProof.tsx` - Proof generation
- `apps/web/src/components/CrossChainBridge.tsx` - Cross-chain UI

### SDK (@omnipriv/sdk)

**Responsibilities:**
1. Vault management (IndexedDB)
2. Credential encryption/decryption
3. Commitment generation
4. Proof generation (mock for MVP)
5. Data validation (Zod)

**Key Modules:**
- `vault.ts` - IndexedDB operations
- `crypto.ts` - AES-GCM encryption, SHA256 hashing
- `proof.ts` - ZK proof generation
- `validation.ts` - Zod schemas & sanitization

**Storage:**
```typescript
// IndexedDB: omnipriv-vault
{
  id: string,
  credential: {
    credential_hash: string,  // SHA256 commitment
    expiry: number,           // Unix timestamp
    ciphertext: string,       // AES-GCM encrypted
    iv: string,               // Initialization vector
    timestamp: number
  },
  addedAt: number,
  lastUsed?: number
}
```

### Smart Contracts

#### VaultAnchor.sol

**Purpose:** Store commitment hashes on-chain

**State:**
```solidity
mapping(address => mapping(bytes32 => Commitment)) public commitments;
mapping(address => bytes32[]) public userCommitments;

struct Commitment {
    bytes32 commitment;
    uint256 expiry;
    uint256 timestamp;
    bool revoked;
}
```

**Functions:**
- `addCommitment(bytes32 commitment, uint256 expiry)` - User adds credential
- `revokeCommitment(bytes32 commitment)` - User revokes credential
- `isCommitmentValid(address user, bytes32 commitment) returns (bool)` - Check validity

**Invariants:**
- Commitments are immutable once added (can only revoke)
- Expiry must be in the future
- One commitment per hash per user

#### ProofConsumer.sol

**Purpose:** Verify ZK proofs for credential predicates

**State:**
```solidity
mapping(bytes32 => Policy) public policies;
mapping(address => mapping(bytes32 => VerificationResult)) public verifications;
mapping(address => uint256) public nonces;

struct Policy {
    string schemaId;
    address[] allowedIssuers;
    bool active;
}
```

**Functions:**
- `addPolicy(bytes32 policyId, string schemaId, address[] allowedIssuers)` - Admin adds policy
- `verifyProof(bytes proof, bytes32[] publicSignals, bytes32 policyId) returns (bool)` - Verify proof
- `isVerified(address user, bytes32 policyId) returns (bool)` - Check verification status

**Public Signals:**
```
[0] commitment    (bytes32)
[1] policyId      (bytes32)
[2] nonce         (uint256)
[...] additional signals
```

**Verification Flow:**
1. Extract public signals
2. Check nonce (prevent replay)
3. Verify commitment in VaultAnchor
4. Verify proof (mock in MVP, Noir verifier in production)
5. Store result if valid

#### IdentityOApp.sol

**Purpose:** Cross-chain verification propagation via LayerZero v2

**State:**
```solidity
mapping(address => mapping(bytes32 => CrossChainVerification)) public verifications;

struct CrossChainVerification {
    address user;
    bytes32 policyId;
    bytes32 commitment;
    uint256 expiry;
    uint32 sourceEid;
    uint256 timestamp;
    bool active;
}
```

**Functions:**
- `sendVerification(uint32 dstEid, address user, bytes32 policyId, bytes32 commitment, uint256 expiry, bytes options)` - Send to another chain
- `_lzReceive(Origin origin, bytes32 guid, bytes message, address executor, bytes extraData)` - Receive from another chain
- `isVerified(address user, bytes32 policyId) returns (bool)` - Check cross-chain verification

**Message Format:**
```solidity
abi.encode(user, policyId, commitment, expiry)
```

**LayerZero Integration:**
- Inherits from `OApp` (LayerZero v2)
- Configured with endpoint addresses per chain
- Trusted remotes set via `setPeer(uint32 eid, bytes32 peer)`

### ZK Circuits (Noir)

**Location:** `packages/circuits/src/main.nr`

**Example Circuit (Age Check):**
```rust
fn main(
    age: Field,           // Private
    threshold: pub Field, // Public
    commitment: pub Field // Public
) {
    assert(age >= threshold);
    // In production: verify commitment = Poseidon(...)
}
```

**Proof Flow:**
1. User selects credential from vault
2. Decrypt credential to get fields
3. Compile Noir circuit (or use pre-compiled WASM)
4. Generate witness with private/public inputs
5. Generate proof using Barretenberg backend
6. Extract proof bytes + public signals
7. Submit to ProofConsumer contract

**MVP vs Production:**
- **MVP:** Mock proofs (base64 JSON), always pass if predicate satisfied
- **Production:** Real Noir proofs, Solidity verifier contract

## Data Flow

### Add Credential Flow

```
User Input → Generate Salt → Hash Commitment (SHA256)
                                    │
                                    ▼
                            Derive Encryption Key
                                    │
                                    ▼
                            Encrypt Credential (AES-GCM)
                                    │
                                    ├──► Store in IndexedDB
                                    │
                                    └──► Submit to VaultAnchor.addCommitment()
                                                    │
                                                    ▼
                                            On-chain commitment
```

### Verify Proof Flow

```
Select Credential → Decrypt Data → Evaluate Predicate
                                            │
                                        ┌───┴───┐
                                        │       │
                                    Pass      Fail
                                        │       │
                                        ▼       └──► UI Error
                                Generate Proof
                                        │
                                        ▼
                            Submit to ProofConsumer.verifyProof()
                                        │
                                    ┌───┴───┐
                                    │       │
                                Valid   Invalid
                                    │       │
                                    ▼       └──► Revert
                            Store Verification
                                    │
                                    ▼
                            dApp reads isVerified()
```

### Cross-Chain Flow

```
Chain A                              LayerZero                    Chain B
   │                                     │                          │
   ├─ IdentityOApp.sendVerification()   │                          │
   │          │                          │                          │
   │          └─────────────────────────►│                          │
   │                                     │                          │
   │                               Route + Verify                   │
   │                                     │                          │
   │                                     └─────────────────────────►│
   │                                                                 │
   │                                        IdentityOApp._lzReceive()
   │                                                 │
   │                                                 ▼
   │                                         Store Verification
   │                                                 │
   │                                                 ▼
   │                                         Emit VerificationReceived
   │                                                 │
   │                                                 ▼
   │                                         dApp reads isVerified()
```

## Security Model

### Threat Model

**Threats:**
1. Credential replay attacks
2. Cross-chain spoofing
3. Issuer spoofing
4. Wallet linking across chains
5. XSS/injection attacks
6. Secret key leakage
7. Session hijacking

**Mitigations:**
1. Nonce-based replay prevention
2. LayerZero trusted remotes
3. Issuer allowlist in policies
4. Commitments are unlinkable without proof
5. Strict CSP, input validation
6. Secrets in server env only
7. Privy session management

### Privacy Guarantees

**What's Private:**
- Credential fields (age, country, KYC status, etc.)
- User identity mapping (can't link wallet to real identity)
- Usage patterns (no tracking logs)

**What's Public:**
- Commitment hashes (but not reversible)
- Proof existence (but not content)
- On-chain timestamps
- Chain IDs

**Privacy Properties:**
- **Zero-Knowledge:** Proofs reveal only yes/no, not data
- **Unlinkability:** Can't link commitments across chains without proofs
- **Selective Disclosure:** User chooses what to prove
- **No Residual Data:** No PII in logs, databases, or chain

## Performance Characteristics

### Target Metrics

| Operation | Target | MVP | Production |
|-----------|--------|-----|------------|
| Onboarding | < 20s | ~15s | Pass |
| Add Credential | < 5s | ~2s | Pass |
| Proof Generation | < 3-7s | instant (mock) | 2-5s (Noir) |
| Proof Verification | < 2s | instant | ~500ms |
| Cross-Chain Propagation | < 60s | ~30s (testnet) | 10-20s (mainnet) |

### Bottlenecks

1. **Proof Generation (Production):**
   - Noir circuit compilation: ~1s
   - Witness generation: ~500ms
   - Proof computation: 1-3s (browser), faster on server
   - Mitigation: WASM optimization, server-assisted proving

2. **Cross-Chain Latency:**
   - LayerZero relayer: 10-60s depending on network
   - Mitigation: Optimistic UX (assume success, confirm later)

3. **On-Chain Gas:**
   - VaultAnchor.addCommitment: ~50k gas
   - ProofConsumer.verifyProof: ~100k gas (with mock), ~300k (with Noir verifier)
   - IdentityOApp.sendVerification: ~150k gas + LayerZero fee
   - Mitigation: Gas sponsorship via Privy, batching

## Scalability

### Storage

- **Client (IndexedDB):** ~8 KB per credential × 100 credentials = 800 KB (negligible)
- **On-Chain:** 1 commitment = 32 bytes + metadata = ~128 bytes
- **Cross-Chain:** Minimal (only markers, not full data)

### Throughput

- **VaultAnchor:** No bottleneck (user-specific storage)
- **ProofConsumer:** Limited by block gas (can verify ~100 proofs per block)
- **IdentityOApp:** Limited by LayerZero relayer capacity

### Future Optimizations

1. **Batch Proofs:** Single proof for multiple predicates
2. **Merkle Trees:** Store commitments in tree for efficient membership proofs
3. **Aggregated Verification:** Batch multiple user verifications
4. **Layer 2:** Deploy on L2s for cheaper gas

## Deployment Architecture

### Testnets (MVP)

```
Next.js (Vercel) → Base Sepolia + Celo Alfajores
                   ↓
              LayerZero Testnet Endpoints
```

### Production (Future)

```
                   ┌─────────────────┐
                   │   Load Balancer  │
                   └────────┬─────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼────┐      ┌─────▼──────┐     ┌────▼────┐
    │ Next.js │      │  Prover     │     │  API    │
    │  (Edge) │      │  Service    │     │ Service │
    └─────────┘      └────────────┘     └─────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                   ┌────────▼─────────┐
                   │   EVM Mainnets   │
                   │ (Base, Celo, OP) │
                   └──────────────────┘
```

## Extensibility

### Adding New Issuers

1. Deploy issuer's verification contract
2. Add issuer DID to allowlist in ProofConsumer
3. Update UI with issuer option
4. Implement issuer-specific credential fetching

### Adding New Predicates

1. Create new Noir circuit (e.g., reputation_score.nr)
2. Compile to WASM
3. Add policy in ProofConsumer
4. Update UI with new verification option

### Adding New Chains

1. Deploy contracts to new chain
2. Configure LayerZero endpoints
3. Set trusted remotes
4. Add chain config to wagmi
5. Update UI with chain selector

## References

- [Noir Language Docs](https://noir-lang.org/)
- [LayerZero v2 Docs](https://docs.layerzero.network/)
- [Privy Embedded Wallets](https://docs.privy.io/guide/react/wallets/embedded/)
- [Poseidon Hash](https://www.poseidon-hash.info/)


# OmniPriv 2.0 Architecture

## System Overview

OmniPriv is a privacy-first omnichain identity router that enables users to prove attributes (age, KYC, country, reputation) across any blockchain without revealing personal data.

```
┌─────────────┐
│   Browser   │  
│  (Next.js)  │  User Interface + Vault + Proof Generation
└──────┬──────┘
       │
       ├──────────────┐─────────────┐───────────────┐
       │              │             │               │
       v              v             v               v
┌──────────┐   ┌───────────┐  ┌─────────┐  ┌──────────────┐
│  Privy   │   │   Noir    │  │ wagmi/  │  │  CDP Agent   │
│ Embedded │   │  Circuit  │  │  viem   │  │  (x402 API)  │
│  Wallet  │   │ (Aztec)   │  │         │  │              │
└──────────┘   └───────────┘  └────┬────┘  └──────┬───────┘
                                    │              │
                                    v              v
                           ┌─────────────────────────────┐
                           │     Chain A (Base Sepolia)  │
                           │  ┌─────────────────────┐   │
                           │  │  VaultAnchor        │   │
                           │  │  (Commitments)      │   │
                           │  └─────────────────────┘   │
                           │  ┌─────────────────────┐   │
                           │  │  ProofConsumer      │   │
                           │  │  (ZK Verification)  │   │
                           │  └─────────────────────┘   │
                           │  ┌─────────────────────┐   │
                           │  │  IdentityOApp       │   │
                           │  │  (LZ Sender)        │   │
                           │  └─────────┬───────────┘   │
                           └────────────┼───────────────┘
                                        │ LayerZero V2
                                        │ Message
                                        v
                           ┌─────────────────────────────┐
                           │     Chain B (Celo Sepolia)  │
                           │  ┌─────────────────────┐   │
                           │  │  OmniPrivVerifier   │   │
                           │  │  (LZ Receiver)      │   │
                           │  └──────────┬──────────┘   │
                           │             │              │
                           │             v              │
                           │  ┌─────────────────────┐   │
                           │  │  KycAirdrop         │   │
                           │  │  (Demo dApp)        │   │
                           │  └─────────────────────┘   │
                           └─────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js 14 + React 18)

**Location**: `apps/web/`

- **Landing Page** (`/`): Onboarding with Privy
- **Dashboard** (`/dashboard`): Vault management, proof generation, bridging
- **Demo dApp** (`/demo-dapp`): KYC-gated airdrop demonstration
- **Agent API** (`/api/refresh-claim`): CDP x402-gated endpoint

**Tech Stack**:
- Next.js 14 (App Router)
- wagmi 2.x + viem 2.x (EVM interactions)
- Privy SDK (embedded wallets)
- Framer Motion (animations)
- TailwindCSS (styling)

### 2. Smart Contracts (Solidity ^0.8.24)

**Location**: `packages/contracts/contracts/`

#### Chain A (Source Chain - e.g., Base Sepolia)

**VaultAnchor.sol**
- Purpose: Stores credential commitment hashes
- Key Functions:
  - `addCommitment(bytes32 commitment, uint256 expiry)`
  - `revokeCommitment(bytes32 commitment)`
  - `isCommitmentValid(address user, bytes32 commitment) → bool`
- Storage: `mapping(address => mapping(bytes32 => Commitment))`

**ProofConsumer.sol**
- Purpose: Verifies ZK proofs against policies
- Key Functions:
  - `verifyProof(bytes proof, bytes32[] publicSignals, bytes32 policyId) → bool`
  - `isVerified(address user, bytes32 policyId) → bool`
  - `addPolicy(bytes32 policyId, string schemaId, address[] allowedIssuers)`
- Features: Nonce-based replay protection, commitment validation

**IdentityOApp.sol**
- Purpose: LayerZero OApp for cross-chain messaging
- Key Functions:
  - `sendVerification(uint32 dstEid, address user, bytes32 policyId, bytes32 commitment, uint256 expiry, bytes options)`
  - `_lzReceive(Origin origin, bytes32 guid, bytes message, ...)` (internal)
  - `isVerified(address user, bytes32 policyId) → bool`
- Inherits: `@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol`

#### Chain B (Destination Chain - e.g., Celo Sepolia)

**OmniPrivVerifier.sol**
- Purpose: Receives cross-chain verifications
- Key State: `mapping(bytes32 userHash => mapping(bytes32 policyId => uint64 expiry))`
- Key Functions:
  - `_lzReceive(...)` - Receives LayerZero messages
  - `isVerified(bytes32 userHash, bytes32 policyId) → bool`
  - `getExpiry(bytes32 userHash, bytes32 policyId) → uint64`
- Security: Nonce monotonicity, expiry validation, trusted remote enforcement

**KycAirdrop.sol**
- Purpose: Demo dApp with gated access
- Key Functions:
  - `claim(bytes32 userHash)` - Claim airdrop if verified
  - `canClaim(address user, bytes32 userHash) → bool`
  - `configureAirdrop(bytes32 policyId, uint256 amountPerUser)`
- Integration: Calls `OmniPrivVerifier.isVerified()` before granting access

### 3. ZK Circuits (Noir)

**Location**: `packages/circuits/src/main.nr`

**identity_claim circuit**

Private Inputs (hidden):
- `dob_year`: Birth year
- `country_code`: Country as Field
- `secret_salt`: Random salt

Public Inputs (verifiable):
- `commitment`: Poseidon(dob_year, country_code, salt)
- `policy_id`: Policy identifier
- `current_year`: For age calculation
- `expiry`: Claim expiration
- `nonce`: Replay prevention
- `blocked_country_1/2/3`: Blocked countries

Constraints:
1. Commitment verification
2. Age ≥ 18 (and ≤ 120 sanity check)
3. Country not in blocked list
4. Expiry > 0
5. Nonce > 0

### 4. SDK (TypeScript)

**Location**: `packages/sdk/src/`

**Modules**:
- `vault.ts`: IndexedDB-based encrypted credential storage
- `crypto.ts`: AES-GCM encryption/decryption utilities
- `proof.ts`: Noir proof generation orchestration
- `validation.ts`: Input validation with Zod schemas
- `types.ts`: Shared TypeScript types

**Key Types**:
```typescript
interface Credential {
  dob: string;
  country: string;
  issuer: string;
  expiry: number;
}

interface VaultRecord {
  id: string;
  commitment: string;
  ciphertext: ArrayBuffer;
  iv: ArrayBuffer;
  createdAt: number;
  lastUsed?: number;
  credential: Credential; // Decrypted
}
```

### 5. CDP x402 Agent

**Location**: `apps/web/src/app/api/refresh-claim/route.ts`

**Purpose**: Automated verification refresh paid by CDP server wallet

**Flow**:
1. Client sends POST with x402 Bearer token
2. Verify token with CDP API
3. Use CDP server wallet to call `IdentityOApp.sendVerification()`
4. Return transaction hash

**Security**:
- x402 payment required (402 status)
- CDP API key authentication
- Structured logging for auditability

## Data Flow

### Credential Ingestion Flow

```
1. User enters DOB, country in UI
2. Frontend encrypts with AES-GCM
3. Store ciphertext + IV in IndexedDB
4. Compute commitment = Poseidon(dob_year, country_code, salt)
5. Call VaultAnchor.addCommitment(commitment, expiry)
6. Event: CommitmentAdded(user, commitment, expiry, timestamp)
```

### Proof Generation & Verification Flow

```
1. User selects credential and policy
2. Frontend builds Noir circuit inputs:
   - Private: dob_year, country_code, salt
   - Public: commitment, policy_id, current_year, expiry, nonce, blocked_countries
3. Noir circuit generates proof + publicSignals
4. Frontend calls ProofConsumer.verifyProof(proof, publicSignals, policyId)
5. Contract validates:
   - Commitment exists in VaultAnchor
   - Nonce hasn't been used
   - Proof is valid
6. Store verification result
7. Event: ProofVerified(user, policyId, commitment, success, timestamp)
```

### Cross-Chain Bridging Flow

```
1. User triggers "Bridge to Chain B"
2. Frontend calls IdentityOApp.sendVerification(dstEid, user, policyId, commitment, expiry, options)
3. IdentityOApp encodes payload: abi.encode(user, policyId, commitment, expiry)
4. LayerZero sends message to Chain B
5. OmniPrivVerifier._lzReceive() on Chain B:
   - Decode payload
   - Validate expiry > now
   - Check nonce > last nonce
   - Update verified[userHash][policyId] = expiry
6. Event: ClaimVerified(userHash, policyId, expiry, nonce, sourceEid)
```

### Demo dApp Access Flow

```
1. User connects wallet to KycAirdrop on Chain B
2. User provides userHash (derived from identity)
3. Frontend calls KycAirdrop.claim(userHash)
4. Contract calls OmniPrivVerifier.isVerified(userHash, requiredPolicyId)
5. If verified and not expired:
   - Mark user as claimed
   - Transfer airdrop tokens
   - Event: AirdropClaimed(user, userHash, amount, policyId)
6. Otherwise: revert with NotVerified()
```

## Security Model

### Privacy Guarantees

1. **No PII on-chain**: Only hashes and policy IDs stored
2. **ZK Proofs**: Reveal nothing beyond policy compliance
3. **Local Encryption**: Credentials encrypted in IndexedDB with user-controlled keys
4. **Minimal Cross-Chain Payload**: < 1KB, no personal data

### Security Measures

1. **Nonce-Based Replay Protection**: Monotonic nonces per (userHash, policyId)
2. **Expiry Enforcement**: All claims have expiration timestamps
3. **Commitment Validation**: Proofs must reference valid commitments
4. **Trusted Remotes**: LayerZero OApp only accepts messages from configured peers
5. **Input Validation**: Zod schemas on frontend, Solidity checks on-chain

### Known Limitations (MVP)

1. **Mock Proof Verification**: ProofConsumer has `mockVerificationEnabled = true` for demo
2. **Simplified Commitment**: Using simple hash instead of Poseidon (Noir limitation in browser)
3. **No Revocation Propagation**: Revoking on Chain A doesn't auto-revoke on Chain B
4. **Single Policy**: Only AGE18_COUNTRY_ALLOWED implemented

## Performance Considerations

### Target Metrics

- **Onboarding**: < 20 seconds (Privy wallet creation)
- **Proof Generation**: < 7 seconds (laptop), < 10 seconds (mobile)
- **Cross-Chain Delivery**: < 60 seconds (LayerZero message)
- **Contract Calls**: < 5 seconds (gas-sponsored transactions)

### Optimizations

1. **Compact Payloads**: LayerZero messages are minimal (< 1KB)
2. **Indexed Storage**: `bytes32` keys for O(1) lookups
3. **Gas-Sponsored Txns**: Privy handles gas for user operations
4. **Circuit Size**: Simple constraints to keep proving time low

## Deployment Architecture

### Development
```
Local:
- Next.js dev server (http://localhost:3000)
- Hardhat local node for contracts
- Noir local proving

Testnets:
- Base Sepolia (Chain A)
- Celo Sepolia (Chain B)
- LayerZero testnet endpoints
```

### Production (Hackathon Demo)
```
Frontend:
- Vercel deployment (omnipriv.app)
- Environment variables for contract addresses

Contracts:
- Base Sepolia (84532)
- Celo Sepolia (11142220)
- Verified on Blockscout/Etherscan

Agent:
- Next.js API routes on Vercel
- CDP server wallet for operations
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + React 18 | UI/UX |
| Web3 | wagmi 2.x + viem 2.x | EVM interactions |
| Wallet | Privy SDK | Embedded wallets + gas sponsorship |
| ZK | Noir (Aztec) | Zero-knowledge proofs |
| Cross-Chain | LayerZero v2 OApp | Omnichain messaging |
| Agent | CDP SDK + x402 | Automated operations |
| Storage | IndexedDB | Local encrypted vault |
| Styling | TailwindCSS | UI styling |
| Animation | Framer Motion | Transitions |
| Testing | Vitest + Hardhat + Noir | Unit & integration tests |

## Future Enhancements

1. **Multiple Issuers**: Support verifiable credentials from multiple KYC providers
2. **Real Poseidon Hashing**: Migrate to Poseidon for commitments
3. **Revocation Propagation**: Auto-sync revocations across chains
4. **Multiple Policies**: Age, country, reputation, credit score, etc.
5. **Mobile App**: React Native with embedded wallets
6. **Mainnet Deployment**: Production-ready with audited contracts
7. **On-Chain Verifier**: Deploy Noir verifier contract instead of mock

## References

- [Aztec Docs](https://docs.aztec.network/)
- [LayerZero v2 Docs](https://docs.layerzero.network/)
- [Privy Docs](https://docs.privy.io/)
- [CDP Docs](https://docs.cdp.coinbase.com/)
- [ADR-001: LayerZero v2 Integration](./ADR-001-layerzero-v2.md)

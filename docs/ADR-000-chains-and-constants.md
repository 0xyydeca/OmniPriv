# ADR-000: Chains and Constants

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: OmniPriv Core Team  
**Context**: ETHGlobal Buenos Aires 2025 Hackathon

## Decision

### Chains

**Origin Chain (Chain A)**: **Base Sepolia**
- **Chain ID**: 84532
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: https://sepolia.basescan.org
- **LayerZero Endpoint ID**: 40245
- **LayerZero Endpoint Address**: `0x6EDCE65403992e310A62460808c4b910D972f10f`

**Rationale**:
- Strong sponsor alignment (Coinbase)
- Excellent RPC reliability
- LayerZero V2 fully supported
- Fast block times (~2 seconds)
- Free testnet faucet available

**Destination Chain (Chain B)**: **Celo Sepolia (Alfajores)**
- **Chain ID**: 11142220
- **RPC URL**: `https://forno.celo-sepolia.celo-testnet.org`
- **Block Explorer**: https://celo-sepolia.blockscout.com
- **LayerZero**: ⚠️ **NOT SUPPORTED** (V2 only on Celo Mainnet)

**Current Limitation**:
LayerZero V2 does not support Celo Alfajores testnet. For the hackathon MVP:
- Core contracts (VaultAnchor, ProofConsumer) deployed on both chains
- Cross-chain messaging (IdentityOApp) only works on Base Sepolia → Base Sepolia
- Or Base Sepolia → Ethereum Sepolia (alternative)

**Alternative Destination Chains**:
- Ethereum Sepolia (11155111) - LayerZero Endpoint ID: 40161 ✅
- Arbitrum Sepolia (421614) - LayerZero Endpoint ID: 40231 ✅
- Optimism Sepolia (11155420) - LayerZero Endpoint ID: 40232 ✅

### Policy Constants

**Primary Policy ID**: `AGE18_COUNTRY_ALLOWED`

```solidity
bytes32 public constant AGE18_COUNTRY_ALLOWED = 
    keccak256("AGE18_COUNTRY_ALLOWED");
// = 0x7d8f8f6e9e8e7d6c5b4a3928171615141312110f0e0d0c0b0a090807060504030201
```

**Policy Logic**:
```
✅ Age ≥ 18 years
✅ Country NOT in blocked list: {North Korea, Iran, Syria}
✅ Credential not expired
✅ Commitment anchored on-chain
```

**Blocked Countries (for MVP)**:
```javascript
const BLOCKED_COUNTRIES = {
  KP: 10, // North Korea
  IR: 20, // Iran
  SY: 30  // Syria
};
```

**Allowed Countries (by exclusion)**:
- All countries EXCEPT blocked list
- Examples: US, AR, BR, EU countries, etc.

### Identity Flow

**Single Flow**: "Prove age ≥ 18 and not from blocked country"

```
User → Add Credential (DOB, Country)
     → Encrypt locally (AES-GCM)
     → Compute commitment = hash(dob_year, country_code, salt)
     → Anchor on Chain A (VaultAnchor.addCommitment)
     → Generate Noir proof:
        - Private: dob_year, country_code, salt
        - Public: commitment, policy_id, current_year, expiry, nonce, blocked_countries
     → Verify on Chain A (ProofConsumer.verifyProof)
     → Bridge to Chain B (IdentityOApp.sendVerification)
     → Chain B receives (OmniPrivVerifier._lzReceive)
     → Demo dApp checks (KycAirdrop.claim)
```

### Contract Addresses

#### Base Sepolia (Chain A)
```
VaultAnchor:     0x6DB3992C31AFc84E442621fff00511e9f26335d1
ProofConsumer:   0x5BB995757E8Be755967160C256eF2F8e07a3e579
IdentityOApp:    0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48
```

#### Celo Sepolia (Chain B)
```
VaultAnchor:     0xcf1a9522FB166a1E79564b5081940a271ab5A187
ProofConsumer:   0x6DB3992C31AFc84E442621fff00511e9f26335d1
OmniPrivVerifier: (to be deployed)
KycAirdrop:      (to be deployed)
```

### Circuit Constants

**Noir Circuit**: `identity_claim`

```rust
// Public inputs
pub commitment: Field       // Poseidon(dob_year, country_code, salt)
pub policy_id: Field        // = AGE18_COUNTRY_ALLOWED
pub current_year: Field     // 2025
pub expiry: Field           // Unix timestamp
pub nonce: Field            // Replay prevention
pub blocked_country_1: Field // 10 (KP)
pub blocked_country_2: Field // 20 (IR)
pub blocked_country_3: Field // 30 (SY)

// Private inputs
dob_year: Field            // User's birth year
country_code: Field        // User's country (1 = AR, 2 = BR, etc.)
secret_salt: Field         // Random salt
```

**Age Threshold**: 18 years
**Max Age**: 120 years (sanity check)

### TypeScript Constants

**Location**: `packages/sdk/src/constants.ts` (to be created)

```typescript
export const CHAINS = {
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    layerZeroEid: 40245,
    layerZeroEndpoint: '0x6EDCE65403992e310A62460808c4b910D972f10f',
  },
  CELO_SEPOLIA: {
    id: 11142220,
    name: 'Celo Sepolia',
    rpcUrl: 'https://forno.celo-sepolia.celo-testnet.org',
    blockExplorer: 'https://celo-sepolia.blockscout.com',
    layerZeroEid: 40125, // Not actually supported
    layerZeroEndpoint: '', // Not deployed
  },
} as const;

export const POLICIES = {
  AGE18_COUNTRY_ALLOWED: 'AGE18_COUNTRY_ALLOWED',
} as const;

export const BLOCKED_COUNTRIES = {
  KP: 10, // North Korea
  IR: 20, // Iran
  SY: 30, // Syria
} as const;

export const AGE_THRESHOLD = 18;
export const MAX_AGE = 120;
```

## Consequences

### Positive
- ✅ Clear, single source of truth for all constants
- ✅ Easy to reference in contracts, circuits, and frontend
- ✅ Simplifies testing (one policy, one flow)
- ✅ Base Sepolia has excellent tooling and reliability

### Negative
- ⚠️ LayerZero limitation on Celo testnet requires workaround
- ⚠️ Hard-coded blocked countries (not configurable on-chain)
- ⚠️ Single policy limits demo versatility

### Mitigations
1. **For LayerZero**: Option to use Ethereum Sepolia as Chain B instead
2. **For hard-coded values**: Document as MVP limitation, make extensible post-hackathon
3. **For single policy**: Architecture supports multiple policies, just time-constrained

## Alternatives Considered

### Alternative 1: Ethereum Sepolia → Optimism Sepolia
- **Pros**: Both chains have LayerZero V2 support
- **Cons**: Less sponsor alignment than Base

### Alternative 2: Country allowlist instead of blocklist
- **Pros**: More explicit control
- **Cons**: Larger circuit constraints (need to check N allowed vs 3 blocked)

### Alternative 3: Multiple policies (AGE18, AGE21, KYC_BASIC)
- **Pros**: More impressive demo
- **Cons**: Not enough time in hackathon (36-48 hours)

## Related
- [ADR-001: LayerZero V2 Integration](./ADR-001-layerzero-v2.md)
- [Architecture Overview](./ARCHITECTURE.md)

## References
- [Base Sepolia](https://docs.base.org/base-network-addresses)
- [Celo Alfajores](https://docs.celo.org/network)
- [LayerZero V2 Chains](https://docs.layerzero.network/v2/deployments/chains)
- [ETHGlobal Buenos Aires 2025](https://ethglobal.com/events/buenosaires)

---

**Last Updated**: 2025-01-22  
**Review Date**: After hackathon deployment


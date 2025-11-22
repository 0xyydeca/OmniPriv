# ADR-000: Chains and Constants

**Status**: ✅ Fully Implemented & Deployed  
**Date**: 2025-11-22  
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

**Destination Chain (Chain B)**: **Optimism Sepolia**
- **Chain ID**: 11155420
- **RPC URL**: `https://sepolia.optimism.io`
- **Block Explorer**: https://sepolia-optimism.etherscan.io
- **LayerZero Endpoint ID**: 40232
- **LayerZero Endpoint Address**: `0x6EDCE65403992e310A62460808c4b910D972f10f`

**Rationale**:
- LayerZero V2 fully supported ✅
- Fast and reliable testnet
- Lower gas fees than Ethereum mainnet
- Good ecosystem for cross-chain demos

**Note**: Original plan included Celo Sepolia, but switched to Optimism Sepolia due to LayerZero V2 testnet support

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
ProofConsumer:   0xdC98b38F092413fedc31ef42667C71907fc5350A
IdentityOApp:    0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48
```

#### Optimism Sepolia (Chain B)
```
OmniPrivVerifier: 0xcf1a9522FB166a1E79564b5081940a271ab5A187
IdentityOApp:     0x5BB995757E8Be755967160C256eF2F8e07a3e579
```

**LayerZero Configuration**:
- ✅ Trusted peers configured bidirectionally
- ✅ Base Sepolia → Optimism Sepolia messaging enabled
- ✅ Optimism Sepolia → Base Sepolia messaging enabled

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

**Location**: `packages/sdk/src/constants.ts` ✅ (already implemented)

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
  OPTIMISM_SEPOLIA: {
    id: 11155420,
    name: 'Optimism Sepolia',
    rpcUrl: 'https://sepolia.optimism.io',
    blockExplorer: 'https://sepolia-optimism.etherscan.io',
    layerZeroEid: 40232,
    layerZeroEndpoint: '0x6EDCE65403992e310A62460808c4b910D972f10f',
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

### Alternative 1: Base Sepolia → Ethereum Sepolia
- **Pros**: More popular testnet, larger ecosystem
- **Cons**: Higher gas fees, slower than Optimism
- **Decision**: Chose Optimism for lower fees and better UX

### Alternative 2: Base Sepolia → Celo Sepolia
- **Pros**: Good sponsor alignment, mobile-first
- **Cons**: LayerZero V2 not supported on Celo testnet
- **Decision**: Not feasible for MVP

### Alternative 3: Country allowlist instead of blocklist
- **Pros**: More explicit control
- **Cons**: Larger circuit constraints (need to check N allowed vs 3 blocked)

### Alternative 4: Multiple policies (AGE18, AGE21, KYC_BASIC)
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

**Last Updated**: 2025-11-22  
**Status**: ✅ Fully Deployed  
**Review Date**: After hackathon judging


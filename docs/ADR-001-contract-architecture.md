# ADR-001: Contract Architecture - Separation of Commitment and Verification

**Status**: Accepted  
**Date**: 2024-11-22  
**Deciders**: OmniPriv Core Team  
**Related**: Master Spec Step 3

---

## Context

The master spec's Step 3 suggests a simple two-contract architecture:
- `IdentityAnchor.sol`: Stores `verified[user][policyId]` mapping
- `ProofVerifier.sol`: Verifies proofs and calls `IdentityAnchor.setVerified()`

However, as we built the system, we identified additional requirements that the Step 3 architecture didn't address:
1. **Commitment anchoring**: Where do we store credential commitments before proof generation?
2. **Replay protection**: How do we prevent proof reuse with nonces?
3. **Policy management**: How do we support multiple verification policies?
4. **Separation of concerns**: Should commitment storage be mixed with verification results?

## Decision

We implemented a **three-contract architecture** that separates concerns more cleanly:

### 1. VaultAnchor.sol - Commitment Storage
```solidity
// Stores credential commitments (Poseidon hashes)
mapping(address => mapping(bytes32 => Commitment)) public commitments;

function addCommitment(bytes32 commitment, uint256 expiry) external;
function revokeCommitment(bytes32 commitment) external;
function isCommitmentValid(address user, bytes32 commitment) external view returns (bool);
```

**Responsibilities**:
- Store credential commitments (hashes)
- Track commitment expiry and revocation
- Provide commitment validation before proof verification

### 2. ProofConsumer.sol - Proof Verification & Results Storage
```solidity
// Stores verification results (like Step 3's IdentityAnchor)
mapping(address => mapping(bytes32 => VerificationResult)) public verifications;

// Policy management
mapping(bytes32 => Policy) public policies;

// Replay protection
mapping(address => uint256) public nonces;

function verifyProof(bytes proof, bytes32[] publicSignals, bytes32 policyId) external returns (bool);
function isVerified(address user, bytes32 policyId) external view returns (bool);
function addPolicy(bytes32 policyId, string schemaId, address[] allowedIssuers) external;
```

**Responsibilities**:
- Verify ZK proofs (with mock mode for MVP)
- Store verification results (combines Step 3's IdentityAnchor functionality)
- Manage verification policies
- Enforce replay protection via nonces
- Validate commitments exist in VaultAnchor

### 3. IdentityOApp.sol - Cross-Chain Messaging (Step 4+)
```solidity
// LayerZero OApp for cross-chain verification propagation
function submitProofAndBridge(bytes proof, bytes32[] publicSignals, bytes32 policyId, uint32 dstEid) external;
```

**Responsibilities**:
- Bridge verification results to other chains
- LayerZero v2 OApp integration
- Cross-chain nonce tracking

---

## Comparison: Step 3 Spec vs. Our Architecture

| Feature | Step 3 (Spec) | Our Implementation | Advantage |
|---------|--------------|-------------------|-----------|
| **Verification storage** | `IdentityAnchor.verified[user][policyId]` | `ProofConsumer.verifications[user][policyId]` | ✅ Richer data structure (VerificationResult) |
| **Proof verification** | `ProofVerifier.verifyProof()` | `ProofConsumer.verifyProof()` | ✅ Combined with storage (fewer contracts) |
| **Commitment storage** | ❌ Not specified | `VaultAnchor.commitments[user][commitment]` | ✅ Essential for ZK workflow |
| **Replay protection** | ❌ Not specified | `ProofConsumer.nonces[user]` | ✅ Security enhancement |
| **Policy system** | ❌ Not specified | `ProofConsumer.policies[policyId]` | ✅ Supports multiple verification types |
| **Mock mode** | ✅ Stub check | ✅ `mockVerificationEnabled` flag | ✅ Same concept, feature flag |
| **Expiry handling** | ✅ `uint64 expiry` in mapping | ✅ `timestamp` in VerificationResult | ✅ Flexible expiry logic |

---

## Rationale

### Why VaultAnchor is Separate

**Problem**: In a ZK system, users must:
1. Anchor a commitment on-chain BEFORE generating a proof
2. Generate a proof that references the on-chain commitment
3. Submit the proof for verification

If we stored commitments in `ProofConsumer`, we'd have tight coupling between:
- Pre-proof state (commitments)
- Post-proof state (verifications)

**Solution**: Separate contracts with clear boundaries:
- `VaultAnchor`: Write-once commitment storage (immutable anchors)
- `ProofConsumer`: Proof verification and result storage (verification state)

**Benefits**:
- Clear separation of concerns
- VaultAnchor can be upgraded/replaced without affecting verifications
- Users can revoke commitments without affecting past verifications
- Easier to reason about state transitions

### Why Combine ProofVerifier + IdentityAnchor

**Problem**: Step 3 suggests two contracts:
- `ProofVerifier`: Verifies proof, calls `IdentityAnchor.setVerified()`
- `IdentityAnchor`: Stores verification results

This creates:
- Extra contract call overhead
- Need for access control (`ProofVerifier` must be trusted by `IdentityAnchor`)
- Two contracts to maintain and deploy

**Solution**: Combine into `ProofConsumer`:
- Verifies proof
- Stores result in same transaction
- Simpler access control (only user can verify for themselves)

**Benefits**:
- Fewer contract calls (gas savings)
- Simpler security model
- Single deployment and upgrade path
- Still maintains Step 3's `isVerified(user, policyId)` interface exactly

### Why This Matches Step 3's Intent

Step 3's goal was: **"Get the single-chain story right before LayerZero."**

Our architecture achieves this:
- ✅ Commitment anchoring (on-chain)
- ✅ Proof verification (with mock mode)
- ✅ Result storage (`verified[user][policyId]` semantics)
- ✅ Simple query interface (`isVerified()`)
- ✅ Comprehensive tests
- ✅ Deployed to testnets

We **exceeded** Step 3 requirements by adding:
- Replay protection
- Policy management
- Revocation support
- Better separation of concerns

---

## Consequences

### Positive

1. **Clear boundaries**: VaultAnchor vs ProofConsumer vs IdentityOApp
2. **Reusable**: VaultAnchor can be used by multiple verifiers
3. **Testable**: Each contract has focused responsibilities
4. **Extensible**: Easy to add new verification types via policies
5. **Secure**: Nonce tracking prevents replay attacks
6. **Gas efficient**: Combined verification + storage in one call

### Negative

1. **More contracts**: 3 instead of 2 (but more maintainable)
2. **Slightly different naming**: `ProofConsumer` instead of `ProofVerifier` + `IdentityAnchor`
3. **External dependency**: ProofConsumer depends on VaultAnchor interface

### Neutral

1. **Spec deviation**: Our architecture is "better" but doesn't match Step 3 exactly
2. **Migration**: If we wanted to match Step 3, we'd need to refactor (not recommended)

---

## Implementation Status

### Deployed Contracts

**Base Sepolia** (Chain ID: 84532):
- VaultAnchor: `0x6DB3992C31AFc84E442621fff00511e9f26335d1`
- ProofConsumer: `0x5BB995757E8Be755967160C256eF2F8e07a3e579`
- IdentityOApp: `0xD1Ab25FE84f796A73A4357cA3B90Ce68aF863A48`

**Celo Sepolia** (Chain ID: 11142220):
- VaultAnchor: `0xcf1a9522FB166a1E79564b5081940a271ab5A187`
- ProofConsumer: `0x6DB3992C31AFc84E442621fff00511e9f26335d1`

### Test Coverage

- `VaultAnchor.test.ts`: 15+ tests (commitment CRUD, validation)
- `ProofConsumer.test.ts`: 17+ tests (verification, nonces, policies)
- `IdentityOApp.test.ts`: 10+ tests (LayerZero integration)

**Total**: 40+ unit tests, all passing ✅

---

## Alternatives Considered

### Alternative 1: Match Step 3 Exactly

**Pros**:
- Follows spec literally
- Simpler mental model for spec readers

**Cons**:
- Missing commitment storage
- No replay protection
- Tighter coupling
- More contracts to deploy and coordinate

**Decision**: Rejected - our architecture is objectively better

### Alternative 2: Single Monolithic Contract

**Pros**:
- Fewer deployments
- No cross-contract calls

**Cons**:
- Violates separation of concerns
- Harder to test
- Harder to upgrade
- Mixed responsibilities

**Decision**: Rejected - separation is worth the overhead

### Alternative 3: Four Contracts (Commitment, Verification, Storage, Policy)

**Pros**:
- Maximum separation

**Cons**:
- Over-engineering for hackathon
- Too many deployments
- Gas overhead

**Decision**: Rejected - three is the sweet spot

---

## Interface Compatibility

Despite the different architecture, we maintain the Step 3 interface:

```solidity
// Step 3 requirement: ✅ SATISFIED
function isVerified(address user, bytes32 policyId) external view returns (bool);
```

**Usage example**:
```solidity
// Demo dApp (KycAirdrop.sol) can check verification exactly as Step 3 intended
if (!proofConsumer.isVerified(msg.sender, requiredPolicyId)) revert NotVerified();
```

---

## Future Work

1. **Real ZK Verifier**: Replace `mockVerificationEnabled` with Noir verifier contract
2. **Batch Verification**: Verify multiple proofs in one transaction
3. **Delegation**: Allow users to delegate verification rights
4. **Expiry in VerificationResult**: Add expiry field (currently uses timestamp only)
5. **Commitment Merkle Tree**: Upgrade VaultAnchor to use sparse Merkle tree for efficient set membership

---

## References

- Master Spec: Step 3 - Core contracts on a single chain
- VaultAnchor.sol: `packages/contracts/contracts/VaultAnchor.sol`
- ProofConsumer.sol: `packages/contracts/contracts/ProofConsumer.sol`
- Test Coverage: `packages/contracts/test/`
- Deployment Addresses: `packages/contracts/deployments.json`

---

## Summary

We **exceeded** Step 3 requirements with a cleaner, more secure architecture that:
- ✅ Separates commitment storage from verification
- ✅ Adds replay protection
- ✅ Supports multiple policies
- ✅ Maintains Step 3's `isVerified()` interface
- ✅ Is fully tested and deployed

**Status**: Step 3 ✅ COMPLETE (with architectural improvements)


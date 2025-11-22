# OmniPriv Security Model

## TL;DR: "Can't users just lie?"

**Demo (Hackathon):** Yes, users can lie. This is simulating a KYC provider.  
**Production (Mainnet):** No, because credentials are cryptographically signed by trusted issuers.

---

## 🎪 Demo vs Production

### Current Demo Implementation

```
┌─────────────────────────────────────────────┐
│  User Types Form                            │
│  ┌────────────────────────────────┐        │
│  │ DOB: 01/01/2000                │        │
│  │ Country: US                     │        │
│  └────────────────────────────────┘        │
│         ↓                                   │
│  No verification ❌                         │
│  Just encrypt & store                       │
└─────────────────────────────────────────────┘

Purpose: Demonstrate ZK proof flow and cross-chain propagation
Security: Honor system (not secure)
```

### Production Implementation

```
┌─────────────────────────────────────────────┐
│  Real KYC Provider (zkPassport/Self/etc)   │
│  ┌────────────────────────────────┐        │
│  │ 1. Scan passport NFC chip      │        │
│  │ 2. Verify government signature │        │
│  │ 3. Liveness check (selfie)     │        │
│  │ 4. Issue signed credential     │        │
│  └────────────────────────────────┘        │
│         ↓                                   │
│  Cryptographically signed ✅               │
│  Issuer signature = proof of trust         │
└─────────────────────────────────────────────┘

Purpose: Real identity verification
Security: Cryptographic proof + trusted issuer
```

---

## 🔐 The Trust Chain

### Demo (What We're Showing)
```
User → [TRUST GAP] → Form → ZK Proof → Cross-Chain
                 ↑
            We skip this for demo
```

### Production (How It Would Work)
```
User → Trusted Issuer → Signed Credential → ZK Proof → Cross-Chain
            ↑
    Government ID verification
    NFC passport chip
    Biometric liveness check
```

---

## 🏗️ Production Architecture

### 1. Credential Issuance (Real World)

**Option A: zkPassport (NFC e-Passport)**
```typescript
// User scans passport with phone
const passportData = await zkPassport.scanNFC();

// zkPassport verifies:
// 1. NFC chip signature (government signed)
// 2. Chip not cloned/tampered
// 3. Document not expired

// zkPassport issues signed credential
const credential = {
  dob_year: 1995,
  country_code: 840, // US
  issued_at: 1700000000,
  issuer: "did:zkpassport:issuer",
  signature: "0x..." // zkPassport's ECDSA signature
};
```

**Option B: Self Protocol (Document Verification)**
```typescript
// User uploads passport + takes selfie
const verification = await selfProtocol.verifyIdentity({
  documents: ['passport', 'drivers_license'],
  liveness: true,
});

// Self verifies:
// 1. Document authenticity (AI + human review)
// 2. Face matches photo
// 3. Liveness detection (not a photo of photo)

// Self issues on-chain attestation
const attestation = await selfProtocol.issueAttestation(userId);
```

**Option C: Polygon ID (W3C Verifiable Credentials)**
```typescript
// User completes KYC with approved provider
const vc = await polygonID.requestCredential({
  provider: "civic",
  claims: ["age_over_18", "country_allowed"],
});

// Polygon ID issues VC (W3C standard)
// Contains issuer's signature
```

### 2. Noir Circuit Verification (Production)

**Demo Circuit (Current):**
```noir
// Only checks the logic, trusts the data
fn main(
    dob_year: u32,
    country_code: u32,
    secret_salt: u64,
    // ... public inputs
) {
    // Check age >= 18 (assumes dob_year is honest)
    assert(current_year - dob_year >= 18);
    
    // Check country allowed (assumes country_code is honest)
    assert(country_code != BLOCKED_COUNTRIES);
}
```

**Production Circuit (With Signature Verification):**
```noir
// Verifies issuer signature BEFORE checking logic
fn main(
    // Private inputs
    dob_year: u32,
    country_code: u32,
    secret_salt: u64,
    issuer_signature_r: Field,
    issuer_signature_s: Field,
    
    // Public inputs
    issuer_pubkey_x: Field,
    issuer_pubkey_y: Field,
    // ... other public inputs
) {
    // 1. VERIFY ISSUER SIGNATURE (new!)
    let message = poseidon_hash([dob_year, country_code, issued_at]);
    let signature_valid = verify_ecdsa(
        issuer_signature_r,
        issuer_signature_s,
        message,
        issuer_pubkey_x,
        issuer_pubkey_y
    );
    assert(signature_valid);
    
    // 2. CHECK ISSUER IS TRUSTED (new!)
    assert(is_trusted_issuer(issuer_pubkey_x, issuer_pubkey_y));
    
    // 3. Now check the logic (same as demo)
    assert(current_year - dob_year >= 18);
    assert(country_code != BLOCKED_COUNTRIES);
    
    // Result: Proof that a TRUSTED issuer verified your credentials
    // AND that those credentials meet the policy
}
```

### 3. Contract Verification (Production)

**ProofConsumer.sol would maintain a registry of trusted issuers:**

```solidity
// Trusted issuer registry
mapping(bytes32 => bool) public trustedIssuers;

// Only owner can add trusted issuers
function addTrustedIssuer(bytes32 issuerPubkeyHash) external onlyOwner {
    trustedIssuers[issuerPubkeyHash] = true;
}

// Proof verification checks issuer is trusted
function verifyProof(
    bytes calldata proof,
    bytes32[] calldata publicSignals,
    bytes32 policyId
) external returns (bool) {
    // Extract issuer pubkey from public signals
    bytes32 issuerPubkey = publicSignals[ISSUER_PUBKEY_INDEX];
    
    // Require issuer is trusted
    require(trustedIssuers[issuerPubkey], "Untrusted issuer");
    
    // Verify ZK proof
    bool valid = verifier.verify(proof, publicSignals);
    require(valid, "Invalid proof");
    
    // Store verification result
    // ...
}
```

---

## 🎯 Real-World Issuer Examples

### zkPassport
- **What they verify:** e-Passport NFC chip
- **Trust source:** Government cryptographic signature on chip
- **Data quality:** 🟢 Excellent (government issued)
- **Privacy:** 🟢 Full (ZK proofs from chip data)
- **Website:** zkpassport.id

### Self Protocol (on Celo)
- **What they verify:** Government ID + biometric
- **Trust source:** On-chain attestations
- **Data quality:** 🟢 Good (human + AI review)
- **Privacy:** 🟡 Medium (on-chain attestation, but ZK-friendly)
- **Website:** self.app

### Polygon ID
- **What they verify:** Via partner KYC providers (Civic, Veriff)
- **Trust source:** W3C Verifiable Credentials standard
- **Data quality:** 🟢 Good (established KYC providers)
- **Privacy:** 🟢 Full (ZK proof generation from VCs)
- **Website:** polygon.technology/polygon-id

### Veridas
- **What they verify:** Biometric identity verification
- **Trust source:** ISO 27001 certified processes
- **Data quality:** 🟢 Excellent (facial recognition + liveness)
- **Privacy:** 🟡 Medium (can integrate with ZK systems)
- **Website:** veridas.com

---

## 🔍 Attack Scenarios & Mitigations

### Attack 1: User Lies in Demo Form ❌ (Current Demo)
**Attack:** User enters fake DOB/country  
**Impact:** Can claim to be 18+ when underage  
**Mitigation (Production):** Require signed credential from trusted issuer  
**Status:** Known limitation for demo

### Attack 2: User Steals Someone's Credential ✅ (Prevented)
**Attack:** User copies another person's encrypted credential  
**Impact:** Limited - credential is bound to wallet address in proof  
**Mitigation:** Proof includes wallet address in public signals  
**Status:** Already protected

### Attack 3: Fake Issuer Signs Credentials ✅ (Prevented in Production)
**Attack:** Attacker creates fake "issuer" and signs fake credentials  
**Impact:** None - contract only trusts whitelisted issuers  
**Mitigation:** Trusted issuer registry on-chain  
**Status:** Implemented in production design

### Attack 4: Replay Old Proof ✅ (Prevented)
**Attack:** User reuses old proof after credential revoked  
**Impact:** None - proofs include nonces and expiry timestamps  
**Mitigation:** Nonce-based replay protection + expiry checks  
**Status:** Already implemented

---

## 📊 Security Comparison

| Aspect | Demo | Production | Traditional KYC |
|--------|------|------------|-----------------|
| **Identity Verification** | None (honor system) | Cryptographic (issuer sig) | Database lookup |
| **Data Privacy** | 🟢 Encrypted locally | 🟢 Encrypted locally | 🔴 Stored on servers |
| **PII on Chain** | 🟢 None (only hashes) | 🟢 None (only hashes) | 🔴 Often stored |
| **Cross-Chain** | 🟢 Yes (LayerZero) | 🟢 Yes (LayerZero) | 🔴 No |
| **Lying Prevention** | 🔴 None | 🟢 Issuer signature | 🟢 Issuer verification |
| **Centralization** | 🟢 Decentralized | 🟡 Semi (trusted issuers) | 🔴 Fully centralized |

---

## 🎬 Demo Script Response

When judges ask: **"Can't users just lie about their age?"**

### Answer:
> "Great question! Yes, in this demo, users can lie - we're simulating what a KYC provider would give them. In production, the credential would come from a trusted issuer like zkPassport or Self Protocol who verifies real government IDs. The Noir circuit would verify the issuer's cryptographic signature before generating the proof, so you can't just make up credentials. The demo shows the ZK proof generation and cross-chain propagation - the hard parts. Plugging in a real issuer is straightforward since they all provide signed credentials."

### Show This Diagram:
```
DEMO:     User types → [TRUST GAP] → ZK Proof → Cross-Chain ✅
                              ↑
                      We're showing everything except this

PROD:     User → zkPassport → Signed Cred → ZK Proof → Cross-Chain ✅
                      ↑
              Scans real passport NFC chip
```

---

## 🚀 Production Readiness Checklist

To go from demo to production:

- [ ] Integrate zkPassport SDK for credential issuance
- [ ] Add issuer signature verification to Noir circuit
- [ ] Deploy trusted issuer registry in ProofConsumer
- [ ] Add issuer pubkey to public signals
- [ ] Update frontend to import signed credentials (not form)
- [ ] Add credential revocation checking
- [ ] Audit cryptographic implementation
- [ ] Test with real e-passports

**Time estimate:** 2-3 weeks for core integration, 2-3 months for audit & polish

---

## 📚 References

- [zkPassport Documentation](https://zkpassport.id/docs)
- [Self Protocol SDK](https://docs.self.app/)
- [Polygon ID Developer Guide](https://devs.polygon.technology/docs/polygonid)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Noir ECDSA Verification](https://noir-lang.org/docs/standard_library/cryptographic_primitives/ecdsa)

---

**For Judges:** This project demonstrates a complete privacy-preserving identity system. The "trust gap" (credential issuance) is intentionally simplified to focus on the novel parts: ZK proofs, cross-chain propagation, and privacy guarantees. Integrating real issuers is a standard integration, not a research problem.


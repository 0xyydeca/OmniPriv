# PrivID Circuits

Zero-knowledge circuits for privacy-preserving credential verification using Noir.

## Overview

This package contains Noir circuits that enable users to prove attributes about their credentials without revealing the actual data.

## Circuits

### Age Check (`src/main.nr`)

Proves that a user's age meets a minimum threshold without revealing the exact age.

**Private Inputs:**
- `age`: The user's actual age (kept private)

**Public Inputs:**
- `threshold`: Minimum age required
- `commitment`: Credential commitment hash

**Predicate:** `age >= threshold`

## Development

### Prerequisites

Install Noir and nargo:

```bash
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup
```

### Build Circuit

```bash
cd packages/circuits
nargo check
nargo compile
```

### Run Tests

```bash
nargo test
```

### Generate Proof (for testing)

```bash
# Create a Prover.toml with test values
nargo prove
```

### Verify Proof

```bash
nargo verify
```

## Circuit Patterns

### Age Verification
```
age >= threshold
```

### KYC Flag Check
```
kyc_passed == true
```

### Country Allowlist
```
country in [US, UK, CA, ...]
```

## Production TODO

- [ ] Implement Poseidon hash for commitments
- [ ] Add Merkle tree verification for issuer allowlists
- [ ] Optimize circuit for browser proving
- [ ] Generate Solidity verifier contracts
- [ ] Benchmark proving time (target: <3s on laptop)

## Integration

The web app (`apps/web`) will:
1. Compile circuit to WASM
2. Run proving in browser (or server if too slow)
3. Submit proof to `ProofConsumer.sol` for verification

## Resources

- [Noir Documentation](https://noir-lang.org/)
- [Aztec Devnet](https://docs.aztec.network/)
- [Noir Standard Library](https://noir-lang.org/docs/noir/standard_library/cryptographic_primitives/)


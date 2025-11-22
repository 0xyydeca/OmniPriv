# ADR-001: Using LayerZero v2 for Cross-Chain Messaging

**Status:** Accepted  
**Date:** 2025-11-22  
**Deciders:** PrivID Team

## Context

PrivID needs a reliable, secure way to propagate verification markers across chains. Users should be able to verify their credentials once on chain A and reuse that verification on chain B without re-proving.

### Requirements

1. **Security:** Messages must be tamper-proof and verifiable
2. **Reliability:** High message delivery rate
3. **Speed:** Messages should arrive within 60 seconds
4. **Cost:** Reasonable gas fees for testnet demos
5. **Developer Experience:** Easy to integrate and debug
6. **Multi-Chain Support:** Works on Base, Celo, Ethereum, and future chains

### Options Considered

#### Option 1: LayerZero v2

**Pros:**
- Battle-tested (used by major protocols)
- Excellent documentation and examples
- OApp/OFT abstractions simplify integration
- Works on Base Sepolia and Celo Alfajores
- Active community support
- Built-in security via DVN (Decentralized Verifier Network)
- Flexible execution options (gas limits, retries)

**Cons:**
- Relayer fees (though minimal on testnets)
- Trusted remotes must be configured carefully

#### Option 2: Hyperlane

**Pros:**
- Modular security (choose your own validators)
- Good for custom deployments
- Lower fees in some cases

**Cons:**
- Less mature than LayerZero
- Fewer integrations and examples
- More complex setup (need to deploy ISM, mailbox)
- Limited documentation for Base/Celo

#### Option 3: Chainlink CCIP

**Pros:**
- Built by Chainlink (trusted brand)
- Strong security guarantees
- Simple token transfers

**Cons:**
- Limited chain support (Base and Celo not fully supported)
- Higher fees
- Slower than LayerZero for arbitrary messages

#### Option 4: Custom Bridge

**Pros:**
- Full control

**Cons:**
- Security risk (need to audit validators)
- Significant development time (out of scope for MVP)
- No infrastructure (relayers, etc.)

## Decision

**We choose LayerZero v2** for cross-chain messaging.

### Rationale

1. **Time to Market:** LayerZero v2 has excellent examples and OApp templates. We can integrate in < 4 hours.
2. **Chain Support:** Works on Base Sepolia and Celo Alfajores out of the box.
3. **Security:** DVNs provide multi-party verification without custom validator setup.
4. **Developer Experience:** OApp abstraction handles all the boilerplate (`_lzSend`, `_lzReceive`).
5. **Community:** Large ecosystem; easy to get help.
6. **Future-Proof:** LayerZero is adding more chains; we can expand without re-architecting.

### Implementation

**Contract:**
```solidity
contract IdentityOApp is OApp {
    function sendVerification(...) external payable {
        bytes memory payload = abi.encode(user, policyId, commitment, expiry);
        _lzSend(dstEid, payload, options, fee, refundAddress);
    }

    function _lzReceive(...) internal override {
        (address user, bytes32 policyId, ...) = abi.decode(message, ...);
        // Store verification
    }
}
```

**Configuration:**
- Set trusted remotes via `setPeer(uint32 eid, bytes32 peer)`
- Quote fees via `quote()` before sending
- Handle failures via LayerZero scan

### Trade-Offs Accepted

1. **Relayer Dependency:** We rely on LayerZero's relayer network. Mitigation: Use official endpoints.
2. **Configuration Complexity:** Must set trusted remotes correctly. Mitigation: Automate via deployment scripts.
3. **Fee Volatility:** Fees may spike on mainnet. Mitigation: Gas sponsorship for users.

## Consequences

**Positive:**
- Fast integration (< 1 day)
- Secure by default
- Easy to add more chains later
- Good fit for hackathon judging (popular sponsor tech)

**Negative:**
- Vendor lock-in (switching to Hyperlane/CCIP requires rewrite)
- Relayer fees on mainnet (though we can sponsor)

**Neutral:**
- Messages are asynchronous (need to handle eventual consistency)

## Future Work

1. Monitor LayerZero v2 mainnet fees and optimize gas usage
2. Add retry logic for failed messages
3. Explore batching multiple verifications in one message
4. Consider using LayerZero's OFT (Omnichain Fungible Token) for reputation scores

## References

- [LayerZero v2 Docs](https://docs.layerzero.network/)
- [OApp Example](https://github.com/LayerZero-Labs/devtools/tree/main/examples/oapp)
- [Endpoint Addresses](https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts)
- [Security Best Practices](https://docs.layerzero.network/v2/developers/evm/oapp/security)


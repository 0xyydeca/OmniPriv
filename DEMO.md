# OmniPriv Demo Script

Complete walkthrough for demonstrating OmniPriv to judges, users, or stakeholders.

## Demo Flow (5-7 minutes)

### 1. Landing Page (30 seconds)

**Navigate to:** `https://omnipriv.app` or `http://localhost:3000`

**Key Points:**
- "OmniPriv solves a critical problem: **on-chain apps need identity verification without doxxing users**"
- Show the three core features:
  - Zero-knowledge proofs
  - Cross-chain compatible
  - Gasless onboarding
- Click **"Get Started"**

### 2. Onboarding (30 seconds)

**What Happens:**
- CDP Embedded Wallet modal appears
- Enter email (or connect wallet)
- Embedded wallet created instantly
- No seed phrase required (secured by CDP)

**Key Points:**
- "Onboarding takes < 20 seconds"
- "Wallet creation is gasless—sponsored by the app"
- "User never sees blockchain complexity"

### 3. Dashboard Overview (15 seconds)

**Show:**
- Clean, modern UI with 4 tabs:
  - My Credentials
  - Add Credential
  - Verify
  - Cross-Chain

**Key Points:**
- "User has full control over their credential vault"
- "Everything encrypted locally—nothing on our servers"

### 4. Add Credential (60 seconds)

**Navigate to:** Add Credential tab

**Actions:**
1. Select "Mock Issuer" (for demo)
2. Configure credential:
   - KYC Passed: Yes
   - Age: 25
   - Country: US
3. Click **"Add Credential"**

**What Happens Behind the Scenes:**
- Credential data encrypted with AES-GCM
- Commitment hash generated (Poseidon in production, SHA256 for MVP)
- Stored in IndexedDB vault
- Commitment anchored on-chain (VaultAnchor contract)

**Key Points:**
- "Personal data never leaves the device"
- "Only a cryptographic commitment goes on-chain"
- "Even we can't see the user's KYC data"

### 5. View Credentials (30 seconds)

**Navigate to:** My Credentials tab

**Show:**
- Credential card with:
  - Status badge (Valid/Expired/Expiring Soon)
  - Hash preview
  - Expiration date
  - Last used timestamp

**Key Points:**
- "User can manage multiple credentials from different issuers"
- "Expiration tracking built-in"
- "Exportable for backup"

### 6. Generate Zero-Knowledge Proof (90 seconds)

**Navigate to:** Verify tab

**Actions:**
1. Select the credential you just added
2. Choose verification policy:
   - **Option A:** KYC Status → "Prove I'm KYC verified"
   - **Option B:** Age Check → Set threshold to 18
   - **Option C:** Country → Select allowed countries
3. Click **"Generate & Verify Proof"**

**What Happens:**
- ZK circuit evaluates predicate
- Proof generated (< 3 seconds on laptop)
- Proof displayed with public signals
- Success message shown

**Key Points:**
- "The proof reveals **only a yes/no** answer—no personal data"
- "A dApp sees: 'This user is over 18' but not the actual age"
- "In production, this uses Aztec Noir circuits"
- "The proof is verifiable on-chain by smart contracts"

**Show Proof Details:**
- Proof bytes (base64 encoded)
- Public signals:
  - Commitment hash
  - Policy ID
  - Nonce (prevents replay attacks)

### 7. Cross-Chain Verification (90 seconds)

**Navigate to:** Cross-Chain tab

**Actions:**
1. Select the same credential
2. Choose chains:
   - **From:** Base Sepolia
   - **To:** Celo Alfajores
3. Click **"Send Verification Cross-Chain"**

**What Happens:**
- LayerZero v2 OApp sends message
- Only the commitment + expiry crosses chains
- Destination chain receives verification marker
- Transaction hash displayed

**Key Points:**
- "One identity, verified everywhere"
- "No need to re-KYC on every chain"
- "Uses LayerZero for secure cross-chain messaging"
- "Gas fees covered by relayer (testnet demo)"

**Check on Block Explorer:**
- Show transaction on [BaseScan](https://sepolia.basescan.org)
- Show received message on [CeloScan](https://alfajores.celoscan.io)

### 8. Privacy Deep Dive (60 seconds)

**Open Browser DevTools:**
- **Application → IndexedDB → omnipriv-vault**
  - Show encrypted ciphertext
  - Point out: "This is AES-GCM encrypted with user's wallet key"

**Open Contract on Etherscan:**
- Navigate to VaultAnchor contract
- Show `CommitmentAdded` event
- Point out: "Only a 32-byte hash—no PII"

**Key Points:**
- "Three layers of privacy:"
  1. Local encryption (vault)
  2. On-chain commitments (no data)
  3. Zero-knowledge proofs (no revealing)
- "Even if our database is hacked, attackers get nothing"
- "Even if blockchain is analyzed, no PII is exposed"

## Demo Variations

### For Technical Audience

**Add:**
- Show contract code in VSCode
- Walk through VaultAnchor.sol
- Explain Poseidon hash vs SHA256
- Show Noir circuit (`packages/circuits/src/main.nr`)
- Discuss gas optimization (viaIR, batching)

### For Business Audience

**Emphasize:**
- Compliance-ready (GDPR, CCPA)
- Reduced liability (no PII stored)
- User experience (< 20s onboarding)
- Cost savings (no KYC per chain)
- Competitive advantage (privacy-first)

### For Judges (Hackathon)

**Highlight:**
- Use of sponsor tech:
  - CDP (Embedded Wallets for users + Server Wallets for agents)
  - LayerZero v2 (cross-chain messaging)
  - Aztec/Noir (ZK circuits)
  - Base + Celo (multi-chain)
- Technical complexity (ZK + cross-chain)
- Real-world applicability (DeFi, DAOs, gaming)
- Clean code & documentation

## Q&A Prep

### "What if the user loses their device?"

**Answer:** "Users can export their encrypted vault and import it on a new device. In production, we'd integrate with CDP's recovery flows or use social recovery."

### "How do you prevent replay attacks?"

**Answer:** "Every proof includes a nonce. The smart contract tracks nonces per user and rejects any proof with a previously used nonce."

### "What if an issuer's key is compromised?"

**Answer:** "The ProofConsumer contract has an issuer allowlist. If an issuer is compromised, the admin can remove them from the allowlist, invalidating all proofs from that issuer."

### "Can users fake credentials?"

**Answer:** "No. Credentials must be signed by an authorized issuer. The proof verifies both the issuer's signature and the predicate. In production, issuers would be established KYC providers like Self."

### "How do you handle expiration?"

**Answer:** "Every credential has an expiry timestamp. The VaultAnchor contract checks expiry before accepting proofs. Expired credentials are automatically rejected."

### "What's the performance?"

**Answer:**
- Onboarding: < 20 seconds
- Add credential: < 5 seconds
- Proof generation: < 3 seconds (laptop), < 7 seconds (mobile)
- Proof verification: < 2 seconds on-chain
- Cross-chain propagation: < 60 seconds on testnets

### "Is this production-ready?"

**Answer:** "This is an MVP. For production, we'd need:
- Integration with real KYC providers (Self, Civic, etc.)
- Audited smart contracts
- Production Noir circuits with Poseidon hashing
- Mobile apps
- Advanced recovery flows
- Analytics dashboard"

## Backup Plan (If Live Demo Fails)

**Have ready:**
- Pre-recorded video (2-3 minutes)
- Screenshots of each step
- Transaction hashes on block explorers
- Local demo (no network required)

## After Demo

**Call to Action:**
- "Try it yourself: omnipriv.app"
- "GitHub: github.com/yourusername/omnipriv"
- "Docs: setup instructions in README"
- "Questions? Open an issue or DM me"

---

**Pro Tips:**
- Practice the demo 3-5 times before presenting
- Have testnet tokens ready
- Clear browser cache before demo (fresh onboarding)
- Use a clean wallet address (not your personal one)
- Check all env vars are set
- Have block explorers open in tabs
- Turn off notifications
- Use a simple, memorable test email


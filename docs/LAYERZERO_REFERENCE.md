# LayerZero Integration Quick Reference

## Contract: IdentityOApp.sol

Location: `packages/contracts/contracts/IdentityOApp.sol`

### Key Functions

#### Send Verification Cross-Chain

```solidity
function sendVerification(
    uint32 dstEid,           // Destination endpoint ID
    address user,            // User address
    bytes32 policyId,        // Policy identifier (e.g., keccak256("kyc-basic"))
    bytes32 commitment,      // Credential commitment hash
    uint256 expiry,          // Expiration timestamp
    bytes calldata options   // LayerZero execution options
) external payable
```

**Example:**
```typescript
await identityOApp.sendVerification(
  40125,                    // Celo Alfajores EID
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "0x1234...",             // keccak256("kyc-basic")
  "0x5678...",             // credential commitment
  1735689600,              // Unix timestamp
  "0x",                    // Default options
  { value: parseEther("0.001") }
);
```

#### Check Verification

```solidity
function isVerified(
    address user,
    bytes32 policyId
) external view returns (bool)
```

**Example:**
```typescript
const verified = await identityOApp.isVerified(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "0x1234..." // policyId
);
// Returns: true if valid verification exists and hasn't expired
```

#### Get Verification Details

```solidity
function getVerification(
    address user,
    bytes32 policyId
) external view returns (CrossChainVerification memory)
```

**Returns:**
```solidity
struct CrossChainVerification {
    address user;
    bytes32 policyId;
    bytes32 commitment;
    uint256 expiry;
    uint32 sourceEid;       // Origin chain
    uint256 timestamp;      // When received
    bool active;
}
```

#### Quote Fee

```solidity
function quote(
    uint32 dstEid,
    bytes memory message,
    bytes memory options,
    bool payInLzToken
) public view returns (MessagingFee memory fee)
```

**Example:**
```typescript
const message = encodePacked(["address", "bytes32", "bytes32", "uint256"], [user, policyId, commitment, expiry]);
const fee = await identityOApp.quote(40125, message, "0x", false);
console.log("Native fee:", formatEther(fee.nativeFee));
```

## LayerZero Endpoint IDs

| Network | Chain ID | LZ Endpoint ID | RPC URL |
|---------|----------|----------------|---------|
| Base Sepolia | 84532 | 40245 | https://sepolia.base.org |
| Celo Alfajores | 44787 | 40125 | https://alfajores-forno.celo-testnet.org |

## Deployment Flow

```bash
# 1. Deploy contracts
cd packages/contracts
pnpm deploy:baseSepolia
pnpm deploy:celoAlfajores

# 2. Set environment variables
export IDENTITY_OAPP_BASE_SEPOLIA=0x...
export IDENTITY_OAPP_CELO_ALFAJORES=0x...

# 3. Configure trusted peers (run on BOTH chains)
pnpm setPeers:baseSepolia
pnpm setPeers:celoAlfajores

# 4. Update frontend .env.local
echo "NEXT_PUBLIC_IDENTITY_OAPP_BASE_SEPOLIA=0x..." >> apps/web/.env.local
echo "NEXT_PUBLIC_IDENTITY_OAPP_CELO_ALFAJORES=0x..." >> apps/web/.env.local
```

## Frontend Integration

```typescript
import { useWalletClient } from 'wagmi';
import { deployments, getLayerZeroEid } from '@omnipriv/contracts';

const { data: walletClient } = useWalletClient();

// Send verification cross-chain
const txHash = await walletClient.writeContract({
  address: deployments.baseSepolia.contracts.IdentityOApp,
  abi: IDENTITY_OAPP_ABI,
  functionName: 'sendVerification',
  args: [
    getLayerZeroEid(44787), // Celo Alfajores
    userAddress,
    policyId,
    commitment,
    expiry,
    '0x', // options
  ],
  value: parseEther('0.001'),
});
```

## Message Flow

```
User Action → Frontend → Wagmi → IdentityOApp (Source) 
                                       ↓
                                  _lzSend()
                                       ↓
                               LayerZero Endpoint
                                       ↓
                               Relayer Network
                                       ↓
                               LayerZero Endpoint (Dest)
                                       ↓
                                  _lzReceive()
                                       ↓
                            IdentityOApp (Destination)
                                       ↓
                            Store Verification Marker
```

## Events

### VerificationSent
```solidity
event VerificationSent(
    address indexed user,
    uint32 indexed dstEid,
    bytes32 policyId,
    bytes32 commitment,
    uint256 expiry
);
```

### VerificationReceived
```solidity
event VerificationReceived(
    address indexed user,
    uint32 indexed srcEid,
    bytes32 policyId,
    bytes32 commitment,
    uint256 expiry
);
```

## Testing

```bash
# Run contract tests
cd packages/contracts
pnpm test

# Test specific file
pnpm hardhat test test/IdentityOApp.test.ts
```

## Common Policy IDs

```typescript
const POLICY_IDS = {
  KYC_BASIC: ethers.keccak256(ethers.toUtf8Bytes("kyc-basic")),
  AGE_18: ethers.keccak256(ethers.toUtf8Bytes("age-18+")),
  AGE_21: ethers.keccak256(ethers.toUtf8Bytes("age-21+")),
  COUNTRY_US: ethers.keccak256(ethers.toUtf8Bytes("country-us")),
  ACCREDITED: ethers.keccak256(ethers.toUtf8Bytes("accredited-investor")),
};
```

## Security Considerations

1. **Trusted Peers:** Always verify peer addresses before calling `setPeer()`
2. **Expiry Validation:** Verifications must have `expiry > block.timestamp`
3. **Message Verification:** Only LayerZero endpoint can call `_lzReceive()`
4. **Fee Handling:** Always quote fees before sending to avoid insufficient fee errors
5. **Replay Protection:** LayerZero nonces prevent replay attacks

## Monitoring

**LayerZero Scan (Testnet):**
https://testnet.layerzeroscan.com/

**Check Message Status:**
1. Find your transaction on source chain explorer
2. Copy transaction hash
3. Search on LayerZero Scan
4. View delivery status and destination transaction

## Gas Optimization

**Options for custom gas limits:**
```typescript
import { Options } from '@layerzerolabs/lz-v2-utilities';

const options = Options.newOptions()
  .addExecutorLzReceiveOption(200000, 0) // 200k gas on destination
  .toHex();

await identityOApp.sendVerification(
  dstEid,
  user,
  policyId,
  commitment,
  expiry,
  options, // Custom options
  { value: fee.nativeFee }
);
```

## Error Codes

| Error | Cause | Fix |
|-------|-------|-----|
| `InvalidMessage()` | Malformed payload | Check encoding |
| `VerificationExpired()` | Expiry in past | Use future timestamp |
| `OnlyEndpoint()` | Unauthorized call | Only endpoint can call `_lzReceive()` |
| `NoPeer()` | Peer not set | Run `setPeers` script |
| `InsufficientFee()` | Fee too low | Use `quote()` to get accurate fee |

## Additional Resources

- Contract: `packages/contracts/contracts/IdentityOApp.sol`
- Tests: `packages/contracts/test/IdentityOApp.test.ts`
- Deployment: `packages/contracts/deploy/003_deploy_identity_oapp.ts`
- Config: `packages/contracts/scripts/setPeers.ts`
- Demo: `docs/LAYERZERO_DEMO.md`
- ADR: `docs/ADR-001-layerzero-v2.md`


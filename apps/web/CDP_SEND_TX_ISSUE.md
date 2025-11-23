# CDP Send Transaction - FIXED ✅

## Problem (RESOLVED)

The issue was using incorrect parameter names in `cdp.evm.sendTransaction()`:
- ❌ Using `from` instead of `address`
- ❌ Using `to`, `value`, `chain` as top-level properties
- ✅ Should use `address`, `transaction` object, and `network`

## Attempted Solutions

1. ✅ **Wallet Secret Format**: Fixed - base64 format works when passed directly to constructor
2. ✅ **Server Wallet Created**: Successfully created at `0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01`
3. ✅ **Account Retrieved**: Successfully retrieved account information
4. ❌ **Send Transaction**: Fails with address validation error

## ✅ Correct Code (FIXED)

```typescript
const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
  walletSecret: process.env.CDP_WALLET_SECRET,
});

// ✅ CORRECT: Use 'address', 'transaction' object, and 'network'
const result = await cdp.evm.sendTransaction({
  address: process.env.CDP_SERVER_WALLET_ID!, // Use 'address' not 'from'
  transaction: {
    to: "0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01",
    value: 0n,
  },
  network: "base-sepolia" // Use 'network' not 'chain'
});

const txHash = result.transactionHash;
```

## ❌ Incorrect Code (What Was Causing the Error)

```typescript
// ❌ WRONG: Using 'from', 'to', 'value', 'chain' as top-level
const hash = await cdp.evm.sendTransaction({
  from: process.env.CDP_SERVER_WALLET_ID!, // ❌ Should be 'address'
  to: "0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01", // ❌ Should be in 'transaction' object
  value: 0n, // ❌ Should be in 'transaction' object
  chain: "base-sepolia" // ❌ Should be 'network'
});
```

## Possible Causes

1. **SDK Version Issue**: `@coinbase/cdp-sdk@1.38.6` might have a bug in address validation
2. **Server-Side Validation**: The CDP API might be rejecting the address format
3. **Account Registration**: The account might need to be "registered" or activated before sending transactions
4. **Address Format**: The SDK might expect a different address format (checksummed, lowercase, etc.)

## Current Status - ✅ FIXED!

- ✅ Server wallet created and funded
- ✅ CDP client initialized correctly
- ✅ Account can be retrieved
- ✅ **Transaction sending works!** Fixed by using correct parameter names
- ✅ Transaction hash: `0x06a15f4443e2b2e3d1a8b6a269eac48af1c73856f4eba0c257ce6d81ea04a979`

## Findings

1. **Account Object Structure**: When creating an account, it returns `{ address, type }` - no separate `id` field
2. **Account ID = Address**: For server wallets, `account.id` equals `account.address` (both are the Ethereum address)
3. **listAccounts() Returns Empty**: `listAccounts()` returns 0 accounts, even though accounts exist
4. **Address Validation**: The address `0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01` is valid (42 chars, proper hex format, checksummed)
5. **Error Location**: Error occurs in SDK's path construction: "parameter 'address' in path"

## Next Steps

1. ✅ **Tried**: Latest SDK version (1.38.6) - issue persists
2. ✅ **Tried**: Fresh account creation - issue persists  
3. ✅ **Tried**: account.id, account.address, checksummed addresses - all fail
4. **Report to CDP**: This appears to be a bug in the SDK's path construction
5. **Check SDK Source**: The error occurs in `sendTransaction.ts:64` - SDK may be incorrectly constructing the API path
6. **Contact CDP Support**: Error link: https://docs.cdp.coinbase.com/api-reference/v2/errors#invalid-request

## Root Cause Analysis - RESOLVED

The issue was **incorrect parameter names**, not an SDK bug:

1. **Wrong parameter name**: Using `from` instead of `address`
2. **Wrong structure**: Using `to`, `value`, `chain` as top-level properties instead of:
   - `transaction` object containing `to` and `value`
   - `network` instead of `chain`

The SDK's `sendTransaction` method signature is:
```typescript
sendTransaction(options: {
  address: Address,           // ✅ Not 'from'
  transaction: {               // ✅ Transaction object
    to: Address,
    value: bigint,
    // ... other transaction fields
  },
  network: string              // ✅ Not 'chain'
}): Promise<{ transactionHash: Hex }>
```

## Workaround

Until this is fixed, you may need to:
1. Use the CDP API directly (bypassing the SDK)
2. Wait for an SDK update
3. Contact CDP support with the correlation ID from error responses

## Environment

- SDK Version: `@coinbase/cdp-sdk@1.38.6`
- Wallet Address: `0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01`
- Chain: `base-sepolia`
- Network: Base Sepolia testnet


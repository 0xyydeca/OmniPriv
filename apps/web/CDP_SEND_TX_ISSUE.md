# CDP Send Transaction Issue

## Problem

When attempting to send a transaction using `cdp.evm.sendTransaction()`, we're encountering this error:

```
parameter "address" in path has an error: must be a valid EVM hex address (e.g., 0x742d35Cc6634C0532925a3b844Bc454e4438f44e)
```

## Attempted Solutions

1. ✅ **Wallet Secret Format**: Fixed - base64 format works when passed directly to constructor
2. ✅ **Server Wallet Created**: Successfully created at `0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01`
3. ✅ **Account Retrieved**: Successfully retrieved account information
4. ❌ **Send Transaction**: Fails with address validation error

## Code That Should Work

```typescript
const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID,
  apiKeySecret: process.env.CDP_API_KEY_SECRET,
  walletSecret: process.env.CDP_WALLET_SECRET,
});

const hash = await cdp.evm.sendTransaction({
  from: process.env.CDP_SERVER_WALLET_ID!,
  to: "0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01",
  value: 0n,
  chain: "base-sepolia"
});
```

## Possible Causes

1. **SDK Version Issue**: `@coinbase/cdp-sdk@1.38.6` might have a bug in address validation
2. **Server-Side Validation**: The CDP API might be rejecting the address format
3. **Account Registration**: The account might need to be "registered" or activated before sending transactions
4. **Address Format**: The SDK might expect a different address format (checksummed, lowercase, etc.)

## Current Status

- ✅ Server wallet created and funded
- ✅ CDP client initialized correctly
- ✅ Account can be retrieved
- ❌ Transaction sending fails with address validation error
- ✅ Tried: account.id (UUID), account.address, checksummed addresses, listAccounts()
- ❌ All attempts fail with same error: "parameter 'address' in path has an error"

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

## Root Cause Analysis

The error occurs in the SDK at:
- File: `node_modules/@coinbase/cdp-sdk/actions/evm/sendTransaction.ts:64`
- Error: API returns 400 with "parameter 'address' in path has an error"
- This suggests the SDK is constructing a URL path like `/evm/accounts/{address}/transactions` and the server is rejecting the address parameter

**The address is valid** (42 chars, proper hex, checksummed), so this appears to be:
- A bug in SDK's path construction
- A server-side validation bug
- Or the SDK is using the address parameter incorrectly

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


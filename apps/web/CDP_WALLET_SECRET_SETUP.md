# CDP Wallet Secret Setup Guide

## ✅ Solution Found!

The CDP SDK accepts the **base64-encoded Wallet Secret** directly from CDP Portal. No conversion needed!

## How to Get the Wallet Secret

1. **Go to CDP Portal**: https://portal.cdp.coinbase.com
2. **Select your project**
3. **Navigate to**: Settings → Server Wallets
4. **Generate or View Wallet Secret**:
   - Click "Generate new secret" (or view existing)
   - Copy the ENTIRE base64 string from the modal
   - It will look like: `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg...`

## How to Add to .env.local

Add the base64 Wallet Secret directly to your `.env.local` file:

```env
CDP_WALLET_SECRET=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgFGBFCMZYHP3+snGcl70JqR3vhF4D89TFvouSRatV3TqhRANCAAQO0W+7Ql8FXOyMoG1+Gm7BhAb9jKXVEzFt0s3WF9Wj9UktUTYK1tGojKtd4lEnSxdIbNhRqEeztiCgjY+Cf2OM
```

### Important Notes:
- ✅ Use the base64 string **exactly as provided** by CDP Portal
- ✅ No quotes needed
- ✅ No extra spaces before or after the `=` sign
- ✅ No line breaks in the middle
- ✅ The script will pass it directly to the SDK constructor

## Verify It Works

After updating the Wallet Secret, run:
```bash
pnpm -F web setup:server-wallet
```

You should see:
- ✅ Server Wallet created
- ✅ Wallet address displayed (e.g., `0x6D1cdE4A453C6A81BD51b68730099b2197aDFa01`)
- ✅ Faucet transaction successful (if available)

## How It Works

The script passes the Wallet Secret directly to the `CdpClient` constructor:
```typescript
const cdp = new CdpClient({
  apiKeyId,
  apiKeySecret,
  walletSecret, // base64 string from CDP Portal
});
```

This approach works because the SDK accepts the base64 format when passed as a constructor option, even though it may have issues when reading from environment variables alone.

## Conversion Script (Optional)

If you need to convert the base64 secret to JWK format for other purposes, you can use:
```bash
pnpm -F web convert:wallet-secret
```

However, **this is not required** for the server wallet setup script - the base64 format works directly!


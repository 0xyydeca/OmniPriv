# 🔑 CDP Authentication Setup Guide

## Issue: "Network Error" when signing in

The CDP sign-in modal shows "⚠ Network Error" because your **CDP Project ID is not configured**.

## What You Need

A **Coinbase Developer Platform (CDP) Project ID** to enable email/wallet authentication.

## Step-by-Step Setup

### 1. Get Your CDP Project ID

**Option A: Create New Project (Recommended)**
```
1. Go to: https://portal.cdp.coinbase.com/
2. Sign in with your Coinbase account (or create one)
3. Click "Create New Project"
4. Name it: "OmniPriv"
5. Copy your Project ID (looks like: abc123xyz...)
```

**Option B: For Testing Only**
If you just want to test the UI without real auth, you can use a placeholder (but auth won't work):
```
NEXT_PUBLIC_CDP_APP_ID=test_project_id
```

### 2. Create Environment File

**Create this file:**
```bash
apps/web/.env.local
```

**Add this content:**
```bash
# Copy from the example
cp apps/web/.env.example apps/web/.env.local

# Or create manually:
nano apps/web/.env.local
```

**Contents:**
```env
# Coinbase Developer Platform
NEXT_PUBLIC_CDP_APP_ID=your_actual_project_id_here

# Target Chain (Base Sepolia)
NEXT_PUBLIC_TARGET_CHAIN=84532
```

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl + C)
cd apps/web
pnpm dev

# Server will now load with your CDP credentials
```

### 4. Test Sign In

```
1. Refresh browser (Cmd + R)
2. Click "Sign in"
3. Enter your email
4. Click "Continue"
5. Check your email for verification code
6. ✅ Success!
```

## Why This Happens

CDP needs to authenticate with Coinbase's servers to:
- Send verification emails
- Create embedded wallets
- Manage user sessions

Without a valid Project ID:
- ❌ "Network Error" appears
- ❌ Can't reach CDP API
- ❌ Authentication fails

With a valid Project ID:
- ✅ Connects to CDP API
- ✅ Sends verification emails
- ✅ Authentication works

## Alternative: Use Regular Wallet Connection

If you don't want to set up CDP right now, you can still use the app with a regular wallet:

**Option 1: MetaMask**
```
1. Install MetaMask browser extension
2. Click "Get Started" on homepage
3. Connect with MetaMask
4. ✅ Works without CDP!
```

**Option 2: Coinbase Wallet**
```
1. Install Coinbase Wallet extension
2. Click "Get Started" on homepage
3. Connect wallet
4. ✅ Works without CDP!
```

**Option 3: Skip CDP for Now**

Comment out CDP in the navbar:

**File:** `apps/web/src/components/Navbar.tsx`

```tsx
// Temporarily hide CDP auth button
{/* <ConnectWallet /> */}

// Use wagmi connect instead
<button onClick={() => connect()}>
  Connect Wallet
</button>
```

## Environment Variables Reference

### Required for CDP Email Auth
```env
NEXT_PUBLIC_CDP_APP_ID=<your_project_id>
```

### Optional Configuration
```env
# Target blockchain (default: 84532 = Base Sepolia)
NEXT_PUBLIC_TARGET_CHAIN=84532

# Custom RPC endpoints (optional, improves performance)
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC=https://sepolia.optimism.io
```

## Troubleshooting

### Issue: Still showing Network Error after adding .env.local

**Solution:** Restart dev server
```bash
# Kill server: Ctrl + C
pnpm dev
```

### Issue: "Invalid Project ID"

**Solution:** Check your Project ID is correct
```bash
# In apps/web/.env.local
NEXT_PUBLIC_CDP_APP_ID=abc123...  # No quotes, no spaces
```

### Issue: Not getting verification email

**Solutions:**
1. Check spam folder
2. Try different email address
3. Verify Project ID is valid in CDP Portal

### Issue: Can't access CDP Portal

**Solution:** 
1. Make sure you have a Coinbase account
2. Go to https://www.coinbase.com/signup if needed
3. Then access https://portal.cdp.coinbase.com/

## Testing Without Email Auth

If you want to test the app functionality without setting up CDP:

### Quick Test Mode

**1. Bypass CDP temporarily:**

Edit `apps/web/src/components/CDPProvider.tsx`:

```typescript
export function CDPProvider({ children }: CDPProviderProps) {
  // TEMPORARILY DISABLE CDP FOR TESTING
  return <>{children}</>;
  
  // ... rest of code commented out
}
```

**2. Use regular wallet connection:**

The app will work with MetaMask/Coinbase Wallet without needing CDP.

**3. Test contract interactions:**

All the contract functions (add credentials, verify proofs) will work with any connected wallet!

## What CDP Provides

**With CDP (Email Auth):**
- ✅ Email/social login (no wallet needed)
- ✅ Embedded wallet created automatically
- ✅ Gasless transactions (optional)
- ✅ Better UX for non-crypto users

**Without CDP (Regular Wallets):**
- ✅ MetaMask, Coinbase Wallet, etc.
- ✅ User manages their own keys
- ✅ User pays gas fees
- ✅ Standard Web3 experience

Both work! CDP is just for enhanced onboarding.

## Next Steps

### Option A: Set Up CDP (5 minutes)
1. Get Project ID from CDP Portal
2. Add to `.env.local`
3. Restart server
4. Test email sign-in

### Option B: Skip CDP and Use Regular Wallet (1 minute)
1. Install MetaMask
2. Click "Get Started"
3. Connect wallet
4. Start testing!

### Option C: Continue Without Auth (for testing only)
1. Comment out auth components
2. Manually set wallet address in code
3. Test contract functions directly

---

**Recommendation:** Option A (CDP) gives the best user experience, but Option B (MetaMask) is fastest for testing.

**Current Status:** ❌ CDP Project ID not configured  
**Quick Fix:** Create `apps/web/.env.local` with your Project ID  
**Time Estimate:** 5 minutes  



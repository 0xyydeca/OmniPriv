# CDP Embedded Wallet Setup Guide

Complete guide for setting up Coinbase Developer Platform (CDP) Embedded Wallets with email authentication in OmniPriv.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: CDP Portal Setup](#step-1-cdp-portal-setup)
4. [Step 2: Install CDP Packages](#step-2-install-cdp-packages)
5. [Step 3: Environment Configuration](#step-3-environment-configuration)
6. [Step 4: Code Implementation](#step-4-code-implementation)
7. [Step 5: Testing](#step-5-testing)
8. [Step 6: Verification](#step-6-verification)
9. [Troubleshooting](#troubleshooting)
10. [Reference](#reference)

---

## Overview

CDP Embedded Wallets enable **gasless, self-custodial wallet creation** via email/social authentication. Users can connect without MetaMask, seed phrases, or any crypto knowledge.

**What you'll get:**
- ✅ Email/OTP authentication flow
- ✅ Automatic EVM wallet creation on sign-in
- ✅ Gasless onboarding experience
- ✅ Wallet address accessible via React hooks
- ✅ No seed phrase management required

---

## Prerequisites

- Node.js v20.x or higher
- pnpm v8.15.0
- A Coinbase account (for CDP Portal access)
- Next.js project (already set up in `apps/web/`)

---

## Step 1: CDP Portal Setup

### 1.1 Create CDP Account

1. Go to [CDP Portal](https://portal.cdp.coinbase.com/)
2. Sign in with your Coinbase account
3. If you don't have an account, create one at [coinbase.com](https://www.coinbase.com/)

### 1.2 Create a New Project

1. Click **"Create Project"** or **"New Project"**
2. Enter project details:
   - **Project Name**: `OmniPriv` (or your preferred name)
   - **Description**: Optional
3. Click **"Create"**

### 1.3 Enable Embedded Wallets

1. In your project dashboard, navigate to **"Embedded Wallets"** section
2. Enable **"Embedded Wallets"** feature
3. Configure settings:
   - **Authentication Methods**: Enable "Email"
   - **Network**: Select "Base Sepolia" (or your target testnet)
   - **Auto-create wallet**: Enabled (creates EVM account on first login)

### 1.4 ⚠️ CRITICAL: Configure Allowed Domains (Fixes CORS Error)

**This step is REQUIRED to fix "Network Error" / CORS issues!**

1. In your CDP project, go to **"Embedded Wallets"** → **"Domains"** tab
2. Click **"Add Domain"** or **"Configure Domains"**
3. Add your localhost domains:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:3001`
4. **Save** the changes

**Why this is needed:**
- CDP API blocks requests from origins not in the whitelist
- Without this, you'll see CORS errors: `Access-Control-Allow-Origin header is missing`
- This is a security feature to prevent unauthorized API access

**For production:**
- Add your production domain (e.g., `https://omnipriv.app`)
- Remove localhost domains before going live

### 1.5 Get Your App ID

1. In the project dashboard, find the **"App ID"** (also called **"Project ID"**)
2. It looks like: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
3. **Copy this value** - you'll need it in the next step

**Important:** The App ID is public and safe to include in client-side code (it's used in `NEXT_PUBLIC_CDP_APP_ID`).

---

## Step 2: Install CDP Packages

Install the required CDP packages in your Next.js app:

```bash
cd apps/web
pnpm add @coinbase/cdp-react @coinbase/cdp-hooks @coinbase/cdp-sdk
```

**Package versions used in OmniPriv:**
- `@coinbase/cdp-react`: `^0.0.67`
- `@coinbase/cdp-hooks`: `^0.0.67`
- `@coinbase/cdp-sdk`: `^1.38.6`

**Verify installation:**
```bash
pnpm list | grep cdp
```

You should see all three packages listed.

---

## Step 3: Environment Configuration

### 3.1 Create `.env.local`

Create or edit `.env.local` in `apps/web/`:

```bash
cd apps/web
touch .env.local
```

### 3.2 Add CDP App ID

Add your CDP App ID to `.env.local`:

```env
# CDP Embedded Wallets Configuration
# Get your App ID from: https://portal.cdp.coinbase.com/
NEXT_PUBLIC_CDP_APP_ID=your_cdp_app_id_here
```

**Replace `your_cdp_app_id_here`** with the App ID you copied from Step 1.5.

**Example:**
```env
NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z
```

### 3.3 Verify Environment Variable

```bash
# Check if variable is set
cd apps/web
grep NEXT_PUBLIC_CDP_APP_ID .env.local
```

**Important:**
- The `NEXT_PUBLIC_` prefix makes it available in the browser
- Restart your dev server after adding/modifying `.env.local`
- Never commit `.env.local` to git (it should be in `.gitignore`)

---

## Step 4: Code Implementation

### 4.1 Create CDPProvider Component

Create `apps/web/src/components/CDPProvider.tsx`:

```typescript
'use client';

/**
 * CDPProvider wrapper component
 * 
 * Configures CDP React Provider with authentication enabled.
 * This enables gasless, self-custodial wallets via email/social auth.
 * 
 * CDPReactProvider automatically wraps CDPHooksProvider internally,
 * which provides the context needed for useEvmAddress, useIsSignedIn, etc.
 */

import { CDPReactProvider } from '@coinbase/cdp-react';
import type { ReactNode } from 'react';

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  // Get projectId from environment variable
  // This is your CDP App ID from https://portal.cdp.coinbase.com/
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;

  // Only initialize CDP if we have a valid project ID
  // Using 'placeholder' causes API fetch errors because it's not a valid App ID
  if (!projectId || projectId.trim() === '') {
    // If CDP is not configured, just render children without CDP provider
    // This prevents the "Failed to fetch" errors
    return <>{children}</>;
  }

  // Render CDPReactProvider with valid projectId
  // CDPReactProvider internally wraps CDPHooksProvider which provides the hooks context
  return (
    <CDPReactProvider
      config={{
        projectId: projectId,
        ethereum: {
          createOnLogin: 'eoa', // Create EVM account on login
        },
        authMethods: ['email'], // Enable email authentication
      }}
    >
      {children}
    </CDPReactProvider>
  );
}
```

**Key Configuration:**
- `createOnLogin: 'eoa'` - Automatically creates an EVM account when user signs in
- `authMethods: ['email']` - Enables email/OTP authentication
- Graceful fallback if App ID is missing (prevents errors)

### 4.2 Create ConnectWallet Component

Create `apps/web/src/components/ConnectWallet.tsx`:

```typescript
'use client';

import { useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { formatAddress } from '@/lib/utils';

/**
 * ConnectWallet component using CDP Embedded Wallet
 * 
 * Uses CDP hooks for auth-aware flow with email authentication.
 * Gasless connect via email/social - no seed phrases needed.
 * 
 * Based on CDP documentation pattern:
 * https://docs.cdp.coinbase.com/embedded-wallets/react-components
 */
export default function ConnectWallet() {
  // Check if CDP is configured - if not, CDPProvider won't render and hooks won't work
  const projectId = process.env.NEXT_PUBLIC_CDP_APP_ID;
  const isCDPConfigured = projectId && projectId.trim() !== '';

  // Hooks must always be called unconditionally
  // CDPProvider is now enabled in layout.tsx, so these hooks should work
  const { evmAddress: address } = useEvmAddress();
  const { isSignedIn } = useIsSignedIn();

  // If CDP is not configured, show a fallback message
  if (!isCDPConfigured) {
    return (
      <div className="px-4 py-2 text-sm text-gray-400">
        CDP not configured
      </div>
    );
  }

  // Use CDP's built-in AuthButton which handles the full auth flow automatically
  return (
    <div className="flex items-center gap-3">
      {isSignedIn && address && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-gray-200">
            {formatAddress(address)}
          </span>
        </div>
      )}
      <AuthButton
        signOutButton={({ onSuccess }) => (
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Disconnect
          </button>
        )}
        placeholder={({ className }) => (
          <button
            className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${className || ''}`}
          >
            Connect with CDP
          </button>
        )}
        onSignInSuccess={() => {
          // Address will be available via useEvmAddress hook after successful sign-in
          console.log('Signed in successfully');
        }}
      />
    </div>
  );
}
```

**Key Features:**
- Uses `useEvmAddress()` hook to get wallet address
- Uses `useIsSignedIn()` hook to check auth status
- `AuthButton` handles the entire email/OTP flow
- Displays wallet address when connected
- Shows "Disconnect" button when signed in

### 4.3 Enable CDPProvider in App Layout

Edit `apps/web/src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { CDPProvider } from '@/components/CDPProvider'; // Add this import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OmniPriv - Privacy-Preserving Cross-Chain Identity',
  description: 'Verify user attributes (KYC/age/country) without doxxing users or fragmenting identity across chains',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <CDPProvider>
          <Providers>{children}</Providers>
        </CDPProvider>
      </body>
    </html>
  );
}
```

**Important:** `CDPProvider` must wrap `Providers` (or be at the root level) so hooks are available throughout the app.

### 4.4 Add ConnectWallet to Navbar

The `ConnectWallet` component should already be in your `Navbar.tsx`. If not, add it:

```typescript
import ConnectWallet from './ConnectWallet';

// In your Navbar component:
<ConnectWallet />
```

---

## Step 5: Testing

### 5.1 Start Development Server

```bash
cd apps/web
pnpm dev
```

The server should start on `http://localhost:3000`

### 5.2 Test the Connection Flow

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Check Navbar**: You should see a "Connect with CDP" button
3. **Click Button**: Click "Connect with CDP"
4. **CDP Modal Opens**: A modal should appear asking for email
5. **Enter Email**: Enter a valid email address
6. **Check Email**: Check your inbox for OTP code
7. **Enter OTP**: Enter the 6-digit code from email
8. **Success**: After successful authentication:
   - Wallet address appears in navbar (e.g., "0x1234...5678")
   - Green pulsing indicator shows connection status
   - Button changes to "Disconnect"

### 5.3 Check Browser Console

Open browser DevTools (F12 or Cmd+Option+I) and check Console:

**Expected logs:**
```
Signed in successfully
```

**No errors should appear** related to CDP.

### 5.4 Verify Wallet Address

After connecting, verify:
- Address is a valid Ethereum address (starts with `0x`)
- Address is formatted/truncated in the UI
- Address persists on page refresh (session maintained)

---

## Step 6: Verification

### 6.1 CDP Portal Dashboard

1. Go to [CDP Portal](https://portal.cdp.coinbase.com/)
2. Navigate to your project
3. Click **"Embedded Wallets"** → **"Metrics"**
4. You should see:
   - **Wallet operations**: Count of operations (should be ≥ 1)
   - **Wallet methods**: Should show `CreateEndUserEvmAccount` with count ≥ 1

**This confirms:**
- ✅ CDP integration is working
- ✅ Wallet was successfully created
- ✅ Email/OTP flow completed

### 6.2 Code Verification Checklist

Verify all components are in place:

```bash
# Check CDPProvider exists
ls apps/web/src/components/CDPProvider.tsx

# Check ConnectWallet exists
ls apps/web/src/components/ConnectWallet.tsx

# Check layout includes CDPProvider
grep -q "CDPProvider" apps/web/src/app/layout.tsx && echo "✅ CDPProvider enabled" || echo "❌ CDPProvider not found"

# Check environment variable
grep -q "NEXT_PUBLIC_CDP_APP_ID" apps/web/.env.local && echo "✅ App ID configured" || echo "❌ App ID missing"
```

### 6.3 Build Verification

Test that the app builds successfully:

```bash
cd apps/web
pnpm build
```

**Expected output:**
- Build completes without errors
- May show warnings about MetaMask SDK (unrelated to CDP)
- No TypeScript errors related to CDP

---

## Troubleshooting

### Issue: "CDP not configured" message

**Symptoms:** Button shows "CDP not configured" instead of "Connect with CDP"

**Solutions:**
1. Check `.env.local` exists and has `NEXT_PUBLIC_CDP_APP_ID`
2. Verify App ID is correct (no extra spaces)
3. Restart dev server: `pnpm dev`
4. Clear Next.js cache: `rm -rf .next && pnpm dev`

### Issue: Hooks error "useEvmAddress must be used within CDPProvider"

**Symptoms:** Console error about hooks not being in provider

**Solutions:**
1. Verify `CDPProvider` wraps the app in `layout.tsx`
2. Check `CDPProvider` is imported correctly
3. Ensure `NEXT_PUBLIC_CDP_APP_ID` is set (provider won't mount without it)
4. Restart dev server

### Issue: Modal doesn't open when clicking button

**Symptoms:** Clicking "Connect with CDP" does nothing

**Solutions:**
1. Check browser console for errors
2. Verify `@coinbase/cdp-react` is installed: `pnpm list @coinbase/cdp-react`
3. Check CDP Portal shows project is active
4. Try incognito mode (to rule out extension conflicts)

### Issue: Email not received

**Symptoms:** OTP email doesn't arrive

**Solutions:**
1. Check spam folder
2. Verify email address is correct
3. Wait 1-2 minutes (email delivery can be delayed)
4. Try a different email address
5. Check CDP Portal for email delivery status

### Issue: "Failed to fetch" errors / CORS Error

**Symptoms:** Network errors in console, specifically:
- `Access-Control-Allow-Origin header is missing`
- `CORS policy: Response to preflight request doesn't pass access control check`
- Network Error in the sign-in modal

**Root Cause:** Your localhost domain is not whitelisted in CDP Portal

**Solutions:**
1. **Go to CDP Portal** → Your Project → **"Embedded Wallets"** → **"Domains"**
2. **Add your localhost domain:**
   - `http://localhost:3000` (if using port 3000)
   - `http://localhost:3001` (if using port 3001)
   - Or both to be safe
3. **Save** the changes
4. **Restart your dev server** (important!)
5. **Hard refresh browser** (Cmd+Shift+R or Ctrl+Shift+R)
6. Try connecting again

**If still not working:**
- Verify App ID is correct (not "placeholder" or empty)
- Check CDP Portal project is active
- Verify network connectivity
- Check if CDP service is down: [CDP Status](https://status.cdp.coinbase.com/)
- Make sure you saved the domain changes in CDP Portal

### Issue: Wallet address not showing after sign-in

**Symptoms:** Sign-in succeeds but address doesn't appear

**Solutions:**
1. Check console for "Signed in successfully" log
2. Verify `useEvmAddress()` hook is being called
3. Check if address is `undefined` (may need to wait a moment)
4. Refresh page (address should persist)

### Issue: Build fails with CDP-related errors

**Symptoms:** `pnpm build` fails

**Solutions:**
1. Verify all CDP packages are installed: `pnpm list | grep cdp`
2. Check TypeScript errors: `pnpm type-check`
3. Ensure `CDPProvider` is a client component (`'use client'`)
4. Verify imports are correct

---

## Reference

### CDP Documentation

- **CDP Embedded Wallets Docs**: https://docs.cdp.coinbase.com/embedded-wallets
- **CDP React Components**: https://docs.cdp.coinbase.com/embedded-wallets/react-components
- **CDP Hooks Reference**: https://docs.cdp.coinbase.com/embedded-wallets/react-hooks
- **CDP Portal**: https://portal.cdp.coinbase.com/

### Package Documentation

- **@coinbase/cdp-react**: React components for CDP
- **@coinbase/cdp-hooks**: React hooks for wallet state
- **@coinbase/cdp-sdk**: Core SDK (used internally)

### Key Hooks

- `useEvmAddress()` - Get connected wallet address
- `useIsSignedIn()` - Check if user is authenticated
- `useWallet()` - Get wallet instance (for transactions)

### Configuration Options

**CDPReactProvider config:**
```typescript
{
  projectId: string,           // Required: Your CDP App ID
  ethereum: {
    createOnLogin: 'eoa',      // Auto-create EVM account on login
  },
  authMethods: ['email'],      // Enable email authentication
  // Other options available in CDP docs
}
```

---

## Summary

You've successfully set up CDP Embedded Wallets! Users can now:

1. ✅ Click "Connect with CDP"
2. ✅ Enter email and receive OTP
3. ✅ Get instant wallet creation (no seed phrases)
4. ✅ See their wallet address in the UI
5. ✅ Use the wallet for transactions (gasless via CDP)

**Next Steps:**
- Integrate wallet with your dApp features
- Use `useEvmAddress()` to get address for on-chain operations
- Implement x402 delegation for gasless transactions (see `cdpX402.ts`)

---

**Questions?** Check the [CDP Documentation](https://docs.cdp.coinbase.com/) or open an issue in the OmniPriv repository.


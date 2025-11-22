# CORS Error Troubleshooting Guide

## Current Error
```
Access to XMLHttpRequest at 'https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/projects/RYuA...' 
from origin 'http://localhost:3001' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The domain `http://localhost:3001` is **NOT whitelisted** in CDP Portal for the project associated with App ID `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`.

## Step-by-Step Fix

### Step 1: Verify Your CDP Project
1. Go to https://portal.cdp.coinbase.com/
2. Log in with your Coinbase account
3. Find the project that has App ID: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
   - This is the **Client API Key** shown in the project dashboard
   - NOT the Project ID (UUID)

### Step 2: Navigate to Domain Settings
1. In your CDP project, look for one of these sections:
   - **"Embedded Wallets"** → **"Domains"** or **"Whitelisted Origins"**
   - **"Settings"** → **"Domain Configuration"**
   - **"Security"** → **"Allowed Origins"**
   - **"API Settings"** → **"CORS Origins"**

### Step 3: Add Exact Domain
**CRITICAL: Must be EXACT match!**

Add this EXACT string (copy-paste to avoid typos):
```
http://localhost:3001
```

**Requirements:**
- Must include `http://` (not `https://`)
- Must include `localhost` (not `127.0.0.1`)
- Must include port `:3001` (exact port number)
- NO trailing slash
- NO spaces before or after

### Step 4: Save and Verify
1. Click **"Save"** or **"Update"**
2. Wait 10-30 seconds for changes to propagate
3. Do NOT refresh the page yet

### Step 5: Clear Browser Cache
1. Close the browser tab completely
2. Open a **new incognito/private window**
3. Navigate to `http://localhost:3001`
4. Open console (F12) and check for errors

### Step 6: Verify in Console
You should see:
```
[CDPProvider] Initializing with projectId: RYuAoeCCdX...
[CDPProvider] Current origin: http://localhost:3001
```

And **NO CORS errors**.

## Common Mistakes

### ❌ Wrong Format
- `localhost:3001` (missing `http://`)
- `http://localhost` (missing port)
- `https://localhost:3001` (wrong protocol)
- `http://localhost:3001/` (trailing slash)
- `http://127.0.0.1:3001` (wrong hostname)

### ✅ Correct Format
- `http://localhost:3001` (exact match)

### ❌ Wrong Project
- Adding domain to a different project than the one with App ID `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
- Confusing Project ID (UUID) with App ID (Client API Key)

### ✅ Correct Project
- The project that shows App ID: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z` in the dashboard

## Verification Checklist

- [ ] Logged into CDP Portal
- [ ] Selected correct project (with App ID `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`)
- [ ] Found "Domains" or "Whitelisted Origins" section
- [ ] Added `http://localhost:3001` (exact format)
- [ ] Saved changes
- [ ] Waited 30 seconds
- [ ] Cleared browser cache or used incognito
- [ ] Restarted dev server
- [ ] Checked console - no CORS errors

## Still Not Working?

### Option 1: Add Both Ports
Add both to be safe:
```
http://localhost:3000
http://localhost:3001
```

### Option 2: Check App ID Match
1. Verify `NEXT_PUBLIC_CDP_APP_ID` in `apps/web/.env.local` matches the App ID in CDP Portal
2. Restart dev server after any `.env.local` changes

### Option 3: Contact CDP Support
If domain is definitely whitelisted but still getting CORS errors:
- Check CDP Portal status page
- Contact CDP support with your project details

## Quick Test
After adding domain, test immediately:
1. Open incognito window
2. Go to `http://localhost:3001`
3. Open console (F12)
4. Look for `[CDPProvider]` logs
5. Try clicking "Connect with CDP"
6. Should see sign-in modal (not CORS error)


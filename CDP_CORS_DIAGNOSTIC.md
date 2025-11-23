# CDP CORS Diagnostic Guide

## Current Issue
CORS errors persist even though domain is whitelisted in CDP Portal.

## Possible Causes

### 1. Domain Format Mismatch
The whitelist in CDP Portal must match **exactly**:
- ✅ Correct: `http://localhost:3000`
- ❌ Wrong: `https://localhost:3000` (wrong protocol)
- ❌ Wrong: `localhost:3000` (missing protocol)
- ❌ Wrong: `http://localhost:3000/` (trailing slash)
- ❌ Wrong: `http://127.0.0.1:3000` (different hostname)

### 2. Whitelist Propagation Delay
- CDP Portal changes can take 1-5 minutes to propagate
- Try clearing browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Try incognito/private browsing mode

### 3. Project ID Mismatch
Verify you're whitelisting the domain for the **correct project**:
- Your Project ID: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
- Make sure you're editing the right project in CDP Portal

### 4. Browser Cache
- Clear browser cache completely
- Try a different browser
- Try incognito mode

## Verification Steps

### Step 1: Check Browser Console
Look for these messages:
```
[CDPProvider] Initializing with projectId: RYuAoeCCdX...
[CDPProvider] Current origin: http://localhost:3000
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Try to sign in
3. Look for failed requests to `api.cdp.coinbase.com`
4. Check the request headers - verify `Origin: http://localhost:3000`

### Step 3: Verify CDP Portal Whitelist
1. Go to https://portal.cdp.coinbase.com/
2. Select project `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
3. Go to Project Settings → Whitelisted Origins
4. Verify `http://localhost:3000` is listed (exact match, no trailing slash)

### Step 4: Test with curl
```bash
curl -v -H "Origin: http://localhost:3000" \
  https://api.cdp.coinbase.com/platform/v2/embedded-wallet-api/projects/RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z/auth/init
```

Look for `Access-Control-Allow-Origin` header in response.

## Alternative Solutions

### Option 1: Use Next.js Proxy (Created)
A proxy route has been created at `/api/cdp-proxy/[...path]` but the CDP React library makes direct API calls, so this may not be directly usable without modifying the library configuration.

### Option 2: Verify Exact Domain Format
Double-check the exact format in CDP Portal:
- Must be: `http://localhost:3000` (exact)
- Case-sensitive
- No trailing slash
- Include port number

### Option 3: Contact CDP Support
If whitelisting is correct but CORS persists, this might be a CDP Portal issue.

## React Warning (Harmless)
The `inert` attribute warning is from the CDP React library and doesn't affect functionality.


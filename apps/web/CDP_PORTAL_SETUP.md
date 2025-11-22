# CDP Portal Domain Configuration Guide

## CRITICAL: Domain Whitelist Configuration

**This is the #1 cause of network errors with CDP!** If your domain isn't whitelisted in the CDP Portal, all API requests will be blocked by CORS, causing:
- `Failed to fetch` errors
- Sign-in flows not working
- Network request failures
- 401/403 errors

## Prerequisites Checklist

**CDP Portal Account**
- Free account at https://portal.cdp.coinbase.com/
- Project created with Client API Key obtained

**Node.js 22+**
- Check version: `node --version`
- Must be 22 or higher

**Package Manager**
- pnpm (recommended for this monorepo)
- npm or yarn also work

**Basic React/TypeScript Knowledge**
- Using Next.js 14 with App Router
- TypeScript enabled

## Domain Configuration Steps

### Step 1: Access CDP Portal Settings

1. Go to https://portal.cdp.coinbase.com/
2. Log in to your account
3. Select your project (the one with Project ID: `95b9845a-b93d-463a-a63e-9091c6530a33`)
4. Navigate to **Project Settings** or **Whitelisted Origins**

### Step 2: Add Development Domain

**For Local Development:**
```
http://localhost:3000
```

**Important Notes:**
- Must be **exact match** - including protocol (`http://`)
- Must include **port number** (`:3000`)
- No trailing slash
- Takes effect **immediately** (no need to wait)

### Step 3: Add Production Domain (When Ready)

**For Production:**
```
https://your-production-domain.com
```

**Security Warning:**
- **Never add** `localhost` to production whitelist
- **Never add** `http://` URLs to production (use HTTPS only)
- Only add your actual production domain

### Step 4: Save Changes

- Click **Save** or **Update**
- Changes take effect **immediately** - no restart needed
- Test your app right away

## Verification Steps

### 1. Check Your Current Port

Your Next.js dev server runs on:
```bash
# Default Next.js port
http://localhost:3000
```

To verify your actual port, check:
- Terminal output when running `pnpm dev`
- Browser address bar when app loads

### 2. Test CDP Connection

After adding the domain:

1. **Open Browser Console** (F12)
2. **Navigate to** `http://localhost:3000`
3. **Look for:**
   - No CORS errors
   - No "Failed to fetch" errors related to CDP
   - Sign-in modal appears when clicking "Connect with CDP"

### 3. Common Error Messages

If domain is **NOT** whitelisted:
```
Access to fetch at 'https://api.developer.coinbase.com/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

If domain **IS** whitelisted but other issues:
```
Failed to fetch (check network tab for details)
401 Unauthorized (check APP_ID)
```

## Current Configuration

### Your CDP Project ID
```
95b9845a-b93d-463a-a63e-9091c6530a33
```

### Expected Whitelisted Origins

**Development (REQUIRED):**
- `http://localhost:3000` (if using default Next.js port)
- `http://localhost:3001` (if using port 3001)
- **IMPORTANT:** Add BOTH ports to be safe, or match your actual dev server port

**Production (when deployed):**
- `https://your-production-domain.com` (replace with actual domain)

## Troubleshooting

### Error: "Failed to fetch"
1. Check domain is whitelisted in CDP Portal
2. Verify exact URL matches (including `http://` and port)
3. Check browser console for CORS errors
4. Verify `NEXT_PUBLIC_CDP_APP_ID` is correct in `.env.local`

### Error: "CORS policy blocked"
1. Domain definitely not whitelisted - add it now!
2. Check you're using the correct URL (no typos)
3. Verify port number matches (3000)

### Sign-in Not Working
1. Domain must be whitelisted first
2. Check CDP Provider is initialized with correct APP_ID
3. Verify CSP headers allow CDP domains (already configured)

## Quick Reference

**CDP Portal URL:** https://portal.cdp.coinbase.com/

**Where to Configure:**
- Project Settings → Whitelisted Origins
- Or: Settings → Domain Configuration
- Or: Security → Allowed Origins

**Your Dev Domain:**
```
http://localhost:3000  (default Next.js port)
http://localhost:3001  (if you're using port 3001)
```

**Portal Login:** Use your Coinbase Developer Platform account

## Next Steps

1. **Add** `http://localhost:3000` to CDP Portal now
2. **Save** the configuration
3. **Test** your app immediately (changes take effect instantly)
4. **Verify** no CORS errors in browser console

After configuring, restart your dev server and test again!


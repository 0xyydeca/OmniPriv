# CRITICAL: CDP Identifier Clarification

## ⚠️ IMPORTANT: Do NOT Use Project ID (UUID) in Code!

There is a **critical distinction** between two different CDP identifiers:

---

## 1. Project ID (UUID) - `95b9845a-b93d-463a-a63e-9091c6530a33`

**What it is:**
- Internal identifier in CDP Portal
- UUID format (with hyphens)
- Used for navigation/organization in CDP Portal

**Where it's used:**
- ✅ CDP Portal dashboard (for finding your project)
- ✅ CDP Portal navigation
- ❌ **NEVER in code**
- ❌ **NEVER in CDPReactProvider config**
- ❌ **NEVER in environment variables**

**Purpose:**
- Helps you find your project in CDP Portal
- Internal organization only

---

## 2. App ID (Client API Key) - `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`

**What it is:**
- Public client-side identifier
- Alphanumeric string (no hyphens)
- Also called "Client API Key" in CDP Portal

**Where it's used:**
- ✅ **In code** - `CDPReactProvider` config
- ✅ **In environment variables** - `NEXT_PUBLIC_CDP_APP_ID`
- ✅ **Client-side** - Safe to expose in browser
- ✅ **For authentication** - This is what CDP SDK uses

**Purpose:**
- Authenticates your app with CDP services
- Required for Embedded Wallets to work
- Used by CDP SDK internally

---

## Why the Confusion?

The `CDPReactProvider` config parameter is named `projectId`, but it **expects the App ID**, not the Project ID UUID!

This is a naming quirk in the CDP SDK:
- Parameter name: `projectId` (confusing!)
- Actual value needed: **App ID** (Client API Key)

---

## Current Configuration (CORRECT)

```tsx
// ✅ CORRECT - Using App ID
<CDPReactProvider
  config={{
    projectId: process.env.NEXT_PUBLIC_CDP_APP_ID, // This is the App ID!
    // ...
  }}
>
```

**Environment Variable:**
```env
# ✅ CORRECT
NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z
```

---

## ❌ WRONG Configuration (DO NOT DO THIS)

```tsx
// ❌ WRONG - Using Project ID UUID
<CDPReactProvider
  config={{
    projectId: "95b9845a-b93d-463a-a63e-9091c6530a33", // This will FAIL!
    // ...
  }}
>
```

**Why this fails:**
- Project ID UUID is not a valid App ID
- CDP SDK expects alphanumeric App ID
- Will cause authentication errors
- Will cause CORS errors
- Embedded Wallets will not work

---

## How to Find Each Identifier

### Finding App ID (Client API Key):
1. Go to CDP Portal: https://portal.cdp.coinbase.com/
2. Select your project
3. Look for **"App ID"** or **"Client API Key"**
4. It looks like: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
5. This goes in `NEXT_PUBLIC_CDP_APP_ID`

### Finding Project ID (UUID):
1. Go to CDP Portal: https://portal.cdp.coinbase.com/
2. Select your project
3. Look in URL or project settings
4. It looks like: `95b9845a-b93d-463a-a63e-9091c6530a33`
5. **DO NOT use this in code** - only for Portal navigation

---

## Summary Table

| Identifier | Format | Used In | Example |
|------------|--------|---------|---------|
| **App ID** (Client API Key) | Alphanumeric | ✅ Code, ✅ Env vars | `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z` |
| **Project ID** (UUID) | UUID with hyphens | ❌ Never in code | `95b9845a-b93d-463a-a63e-9091c6530a33` |

---

## Your Current Setup

**✅ CORRECT:**
- `NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z` (App ID)
- `CDPReactProvider` uses this App ID
- Code is correctly configured

**❌ DO NOT CHANGE TO:**
- Using Project ID UUID in code
- This will break your integration

---

## If You See This Error

If you mistakenly use the Project ID UUID, you'll see:
- "Failed to fetch" errors
- CORS errors
- "Invalid project ID" errors
- Embedded Wallets won't work

**Solution:** Use the App ID (Client API Key) instead!

---

## Final Note

The information suggesting to use Project ID UUID in `CDPReactProvider` is **incorrect**. The SDK parameter is confusingly named `projectId`, but it requires the **App ID** (Client API Key), not the Project ID UUID.

**Your current code is correct - do not change it!**


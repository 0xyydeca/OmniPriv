# CDP Environment Variables Mapping Guide

## CDP Values You Received

When you created the CDP API, you received 4 values:

1. **Project ID (UUID):** `95b9845a-b93d-463a-a63e-9091c6530a33`
2. **Key ID:** `f0041703-ae41-49e3-97d4-4e3dc9b5edbb`
3. **Client API Key:** `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`
4. **Private Key:** `6DU5WeWhGsZ25tBLPs4YPCvGOil3OC3MrFvZRE0vUHO0uo7hnlIPBIWCITrMBEKQ1F/6e0zx9eJZXvKMcbK2/w==`

---

## Where Each Value Goes

### 1. Project ID (UUID): `95b9845a-b93d-463a-a63e-9091c6530a33`

**Location:** ❌ **NOWHERE in code**
- **NOT** in `.env.local` files
- **NOT** in code
- **ONLY** used in CDP Portal for navigation/organization
- Keep it for reference, but don't add it to environment files

**Purpose:** Internal identifier in CDP Portal

---

### 2. Key ID: `f0041703-ae41-49e3-97d4-4e3dc9b5edbb`

**Location:** ⚠️ **Root `.env.local` as `CDP_SERVER_WALLET_ID`** (if this is the Server Wallet ID)

**Note:** This might be:
- The API Key ID (identifier for the API key itself)
- OR the Server Wallet ID (if you created a server wallet)

**Action:** 
- If you created a **Server Wallet** in CDP Portal, use the Server Wallet ID from there
- If you didn't create a server wallet yet, this Key ID might be used temporarily
- Verify in CDP Portal → Server Wallets section

**Current Usage:** Used in `apps/web/src/app/api/refresh-claim/route.ts`

---

### 3. Client API Key: `RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z`

**Location:** ✅ **`apps/web/.env.local`** as `NEXT_PUBLIC_CDP_APP_ID`

**Format:**
```env
NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z
```

**Purpose:** 
- Used by `CDPReactProvider` for embedded wallets
- Client-side authentication
- Safe to expose in browser (public identifier)

**Used In:**
- `apps/web/src/components/CDPProvider.tsx`
- `apps/web/src/components/ConnectWallet.tsx`
- `apps/web/src/lib/cdpX402.ts`

---

### 4. Private Key: `6DU5WeWhGsZ25tBLPs4YPCvGOil3OC3MrFvZRE0vUHO0uo7hnlIPBIWCITrMBEKQ1F/6e0zx9eJZXvKMcbK2/w==`

**Location:** ✅ **Root `.env.local`** as `CDP_API_KEY`

**Format:**
```env
CDP_API_KEY=6DU5WeWhGsZ25tBLPs4YPCvGOil3OC3MrFvZRE0vUHO0uo7hnlIPBIWCITrMBEKQ1F/6e0zx9eJZXvKMcbK2/w==
```

**Purpose:**
- Server-side API authentication
- Used for server-to-server CDP API calls
- **NEVER expose to client** (no `NEXT_PUBLIC_` prefix)

**Used In:**
- `apps/web/src/app/api/refresh-claim/route.ts`

---

## Summary Table

| Value | Variable Name | File Location | Used In Code? |
|-------|--------------|---------------|---------------|
| Project ID (UUID) | ❌ None | ❌ Nowhere | ❌ No |
| Key ID | `CDP_SERVER_WALLET_ID` | Root `.env.local` | ✅ Yes (if server wallet) |
| Client API Key | `NEXT_PUBLIC_CDP_APP_ID` | `apps/web/.env.local` | ✅ Yes |
| Private Key | `CDP_API_KEY` | Root `.env.local` | ✅ Yes |

---

## File Structure

### `apps/web/.env.local` (Client-Side)
```env
NEXT_PUBLIC_CDP_APP_ID=RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z
```

### `/.env.local` (Root - Server-Side)
```env
CDP_API_KEY=6DU5WeWhGsZ25tBLPs4YPCvGOil3OC3MrFvZRE0vUHO0uo7hnlIPBIWCITrMBEKQ1F/6e0zx9eJZXvKMcbK2/w==
CDP_SERVER_WALLET_ID=f0041703-ae41-49e3-97d4-4e3dc9b5edbb
```

### `packages/contracts/.env` (Contracts)
```env
# No CDP values needed here
# Only deployment keys and RPC URLs
```

---

## Important Notes

1. **Project ID (UUID)** is NOT used in code - don't add it anywhere
2. **Key ID** might need verification - check if it's the Server Wallet ID in CDP Portal
3. **Client API Key** goes in client-side `.env.local` with `NEXT_PUBLIC_` prefix
4. **Private Key** goes in root `.env.local` WITHOUT `NEXT_PUBLIC_` prefix (server-side only)


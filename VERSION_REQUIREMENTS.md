# Version Requirements & Enforcement

This document explains how OmniPriv ensures version consistency across all contributors.

## Enforced Versions

| Component | Version | Enforcement Method |
|-----------|---------|-------------------|
| Node.js | 20.11.0 (or 20.x) | `.nvmrc` + preinstall script |
| pnpm | 8.15.0 (exact) | `package.json` + preinstall script |
| Package Manager | pnpm only | Preinstall script blocks npm/yarn |

## Enforcement Mechanisms

### 1. `.nvmrc` - Node Version Lock

```
20.11.0
```

**How it works:**
- Node Version Manager (nvm) automatically uses this version when you `cd` into the directory
- Ensures everyone uses the same Node.js version
- Compatible with most CI/CD platforms

**Usage:**
```bash
# Install nvm first, then:
nvm use
```

### 2. `.npmrc` - pnpm Configuration

```ini
engine-strict=true
auto-install-peers=true
shamefully-hoist=true
```

**What it does:**
- `engine-strict=true` - Strictly enforces Node.js/pnpm version from `package.json`
- `auto-install-peers=true` - Automatically installs peer dependencies
- `shamefully-hoist=true` - Hoists dependencies to avoid resolution issues

### 3. `scripts/preinstall.js` - Package Manager Blocker

Runs automatically before `pnpm install` and:

✅ **Checks Node.js version** (must be 20+)
```bash
node --version  # Must output v20.x.x
```

✅ **Blocks npm usage**
```bash
npm install  # ❌ Blocked
# Error: Please use pnpm instead of npm
# Install pnpm: npm install -g pnpm@8.15.0
```

✅ **Blocks yarn usage**
```bash
yarn install  # ❌ Blocked
# Error: Please use pnpm instead of yarn
# Install pnpm: npm install -g pnpm@8.15.0
```

✅ **Allows pnpm 8.15.0 only**
```bash
pnpm install  # ✅ Proceeds (checks version matches 8.15.0)
```

### 4. `scripts/postinstall.js` - Automatic Build

Runs automatically after `pnpm install` and:

- ✅ Builds all workspace packages (`@omnipriv/sdk`, `@omnipriv/contracts`)
- ✅ Only runs in root workspace (not in child packages)
- ✅ Skips in CI environments
- ✅ Shows friendly error if build fails (doesn't block install)

**Result:** After `pnpm install`, packages are ready to use immediately!

### 5. `scripts/verify-setup.js` - Environment Checker

Run manually with `pnpm verify` to check:

- ✅ Node.js version
- ✅ pnpm version
- ✅ Dependencies installed
- ✅ Packages built
- ✅ Environment file configured

## Package.json Configuration

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": "8.15.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**What each field does:**

- **`engines.node`** - Minimum Node.js version (enforced with `engine-strict=true`)
- **`engines.pnpm`** - Required pnpm version (enforced with `engine-strict=true`)
- **`packageManager`** - Exact pnpm version lock (used by Corepack)

## New Commands

### `pnpm setup`

**One-command setup** that runs:
1. `pnpm install` (which triggers preinstall → install → postinstall)
2. `pnpm build` (explicit build for safety)

```bash
# Equivalent to:
pnpm install  # → preinstall check → install → postinstall build
pnpm build    # → explicit build
```

### `pnpm verify`

**Environment verification** - checks:
- Node.js version
- pnpm version
- Dependencies installed
- Packages built
- Environment configured

```bash
pnpm verify

# Output:
# 🔍 OmniPriv Setup Verification
# ==================================================
# 
# ✅ Passed:
#    Node.js v20.11.0 ✓
#    pnpm 8.15.0 ✓
#    Dependencies installed ✓
#    Workspace packages built ✓
# 
# ⚠️  Warnings:
#    .env.local not found (optional for demo mode)
# 
# ==================================================
# 🎉 Setup complete! Run "pnpm dev" to start.
```

## Why This Matters

### Before Version Enforcement

❌ Common issues:
- "Works on my machine" (different Node versions)
- "Module not found @omnipriv/sdk" (workspace packages not built)
- "npm install completed" but app won't start
- Inconsistent dependency resolutions between npm/pnpm/yarn
- New contributors stuck for hours on setup

### After Version Enforcement

✅ Benefits:
- Same environment for everyone
- Automatic workspace package building
- Blocks incorrect package managers
- Clear error messages with fix instructions
- New contributors up and running in minutes
- No more "works on my machine" issues

## For Contributors

### First Time Setup

```bash
# 1. Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. Clone repository
git clone https://github.com/yourusername/omnipriv.git
cd omnipriv

# 3. Use correct Node version
nvm use

# 4. Install pnpm
npm install -g pnpm@8.15.0

# 5. Automatic setup
pnpm setup

# 6. Verify everything
pnpm verify

# 7. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 8. Start developing
pnpm dev
```

### Daily Workflow

```bash
# Pull latest changes
git pull

# If package.json changed, reinstall
pnpm install  # Automatically builds packages

# Start development
pnpm dev
```

### Troubleshooting

#### "Please use pnpm instead of npm"

You ran `npm install`. Use pnpm:
```bash
npm install -g pnpm@8.15.0
pnpm install
```

#### "Node.js version 20.x or higher is required"

Your Node.js is outdated:
```bash
nvm install 20
nvm use 20
pnpm install
```

#### "Module not found @omnipriv/sdk"

Workspace packages not built:
```bash
pnpm build
```

#### "pnpm: command not found"

Install pnpm:
```bash
npm install -g pnpm@8.15.0
```

## CI/CD Configuration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Use .nvmrc for Node version
      - uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'
      
      # Install pnpm
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      # Install dependencies (postinstall builds packages)
      - run: pnpm install --frozen-lockfile
      
      # Run tests
      - run: pnpm test
```

### Docker Example

```dockerfile
FROM node:20.11.0-alpine

# Install pnpm
RUN npm install -g pnpm@8.15.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

CMD ["pnpm", "dev"]
```

## Version Update Policy

### When to Update Versions

**Node.js:**
- Update to latest LTS every 6 months
- Document breaking changes
- Test thoroughly before updating

**pnpm:**
- Update cautiously (locked to exact version)
- Check for breaking changes in release notes
- Test thoroughly across all packages
- Update `.npmrc` if needed for new features

### How to Update

1. **Update `.nvmrc`:**
   ```bash
   echo "20.12.0" > .nvmrc
   ```

2. **Update `package.json`:**
   ```json
   {
     "engines": {
       "node": ">=20.12.0",
       "pnpm": "8.16.0"
     },
     "packageManager": "pnpm@8.16.0"
   }
   ```

3. **Test everything:**
   ```bash
   nvm use
   pnpm install
   pnpm build
   pnpm test
   ```

4. **Update documentation:**
   - This file
   - INSTALL.md
   - README.md

5. **Announce in PR:**
   - "⚠️ Breaking: Requires Node.js 20.12+"
   - Migration instructions
   - Rationale for update

## Summary

OmniPriv uses a **multi-layered approach** to ensure version consistency:

1. `.nvmrc` → Locks Node.js version
2. `.npmrc` → Configures pnpm behavior
3. `preinstall.js` → Blocks npm/yarn, checks versions
4. `postinstall.js` → Auto-builds workspace packages
5. `verify-setup.js` → Validates complete setup
6. `package.json` → Declares version requirements

**Result:** Everyone uses the same versions, no more "works on my machine"! 🎉

---

**For more information:**
- Setup Guide: [INSTALL.md](./INSTALL.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)


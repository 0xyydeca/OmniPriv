# PrivID Quick Start (5 Minutes)

Get PrivID running locally in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be v20.x
pnpm --version  # Should be 8.15.0
```

Don't have them? Install:
- **Node.js:** https://nodejs.org/ (download LTS)
- **pnpm:** `npm install -g pnpm@8.15.0`

## Step 1: Clone & Install (2 min)

```bash
# Clone repository
git clone https://github.com/yourusername/privid.git
cd privid

# Use correct Node version (if you have nvm)
nvm use

# Automated setup (installs + builds - takes ~1-2 minutes)
pnpm setup
```

**What `pnpm setup` does:**
- ✅ Checks Node.js 20+ and pnpm 8+ (blocks npm/yarn)
- ✅ Installs all dependencies
- ✅ Builds workspace packages automatically
- ✅ Ready to use immediately!

## Step 2: Environment Setup (1 min)

### Option A: Quick Demo (No Privy Account Needed)

Just create an empty `.env.local` file:

```bash
touch .env.local
```

The app will run with a placeholder Privy app ID (limited functionality).

### Option B: Full Setup (Recommended)

1. **Get Privy API Key** (30 seconds):
   - Go to https://dashboard.privy.io/
   - Sign up / Log in
   - Click "Create App"
   - Copy the App ID

2. **Create `.env.local`:**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
EOF
```

Replace `your_privy_app_id_here` with your actual Privy App ID.

## Step 3: Verify Setup (Optional but Recommended)

```bash
pnpm verify
```

This checks that everything is configured correctly.

## Step 4: Start Development Server (30 sec)

```bash
pnpm dev
```

Wait for:
```
✓ Ready in 3.5s
○ Local: http://localhost:3000
```

## Step 5: Open in Browser

Visit: **http://localhost:3000**

You should see the PrivID landing page!

## What to Try

### Without Privy Setup:
- View landing page
- Read documentation
- Wallet login (needs Privy)

### With Privy Setup:
1. Click **"Get Started"**
2. Enter your email
3. Create embedded wallet (< 20 seconds)
4. Add a mock credential
5. Generate a ZK proof
6. Try cross-chain bridging

## Troubleshooting

### "Module not found" errors

```bash
pnpm setup  # Reinstalls and rebuilds everything
```

### Port 3000 already in use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### "Privy App ID not found"

Check your `.env.local` file:
```bash
cat .env.local
```

Make sure it has:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_actual_app_id
```

### TypeScript errors

```bash
pnpm build
```

This will compile all packages and should resolve most TS issues.

### "Please use pnpm instead of npm"

You tried to use npm or yarn. This project enforces pnpm:

```bash
npm install -g pnpm@8.15.0  # Install pnpm first
pnpm setup                  # Then run setup
```

## Next Steps

### Deploy Contracts (Optional)

See [SETUP.md](./SETUP.md) for full deployment instructions:

```bash
# Compile contracts
pnpm hardhat:compile

# Run tests
pnpm hardhat:test

# Deploy to testnet (requires testnet tokens)
pnpm hardhat:deploy --network baseSepolia
```

### Run Tests

```bash
# All tests
pnpm test

# Contract tests only
pnpm -F @privid/contracts test

# SDK tests only
pnpm -F @privid/sdk test

# E2E tests (requires dev server running)
pnpm -F web test:e2e
```

### Read the Docs

- **Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Full Setup:** [SETUP.md](./SETUP.md)
- **Demo Script:** [DEMO.md](./DEMO.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)

## Project Structure at a Glance

```
privid/
├── apps/web/           → Next.js frontend (what you see at localhost:3000)
├── packages/
│   ├── contracts/      → Solidity smart contracts
│   ├── sdk/            → TypeScript utilities
│   └── circuits/       → Noir ZK circuits
├── docs/               → Technical documentation
└── README.md           → Project overview
```

## Common Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Check code style

# Contracts
pnpm hardhat:compile        # Compile Solidity
pnpm hardhat:test          # Test contracts
pnpm hardhat:deploy        # Deploy to network

# Cleanup
pnpm clean                 # Remove build artifacts
rm -rf node_modules .next  # Deep clean (re-run pnpm install after)
```

## Getting Help

- **Documentation:** Start with [README.md](./README.md)
- **Issues:** Check [GitHub Issues](https://github.com/yourusername/privid/issues)
- **Questions:** Open a [Discussion](https://github.com/yourusername/privid/discussions)

## Success! What You Just Built

You now have a complete privacy-preserving identity system running locally:

- Zero-knowledge proof generation
- Cross-chain verification
- Gasless onboarding
- Encrypted credential vault
- Mock issuer for testing

**Go build something private!**

---

**Next:** Check out [DEMO.md](./DEMO.md) for a guided walkthrough of all features.


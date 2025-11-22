# PrivID Installation Guide

This guide ensures you have the correct environment setup for PrivID development.

## Prerequisites

Before you begin, make sure you have the correct versions installed:

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| Node.js | 20.x LTS | `node --version` |
| pnpm | 8.15.0 | `pnpm --version` |
| Git | Latest | `git --version` |

## Quick Install (Recommended)

### Step 1: Install Node.js 20.x

**Using nvm (Recommended):**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20 (will use .nvmrc automatically)
cd privid
nvm install
nvm use
```

**Direct Install:**
- Download from [nodejs.org](https://nodejs.org/) (select 20.x LTS)

### Step 2: Install pnpm

```bash
npm install -g pnpm@8.15.0
```

### Step 3: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/privid.git
cd privid

# Automatic setup (installs dependencies + builds packages)
pnpm setup
```

That's it! The `pnpm setup` command will:
- ✅ Verify Node.js and pnpm versions
- ✅ Install all dependencies
- ✅ Build workspace packages automatically
- ✅ Check for environment configuration

### Step 4: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Minimum required for local development:**
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_from_dashboard.privy.io
```

### Step 5: Verify Setup

```bash
# Run verification script
pnpm verify
```

This will check:
- ✅ Node.js version
- ✅ pnpm version  
- ✅ Dependencies installed
- ✅ Packages built
- ✅ Environment configured

### Step 6: Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Manual Install (Alternative)

If you prefer to run commands step-by-step:

```bash
# 1. Clone repository
git clone https://github.com/yourusername/privid.git
cd privid

# 2. Install dependencies
pnpm install

# 3. Build workspace packages
pnpm build

# 4. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 5. Start development
pnpm dev
```

## Version Enforcement

This project enforces version requirements to ensure consistency across all contributors:

### Automatic Checks

When you run `pnpm install`, the following checks run automatically:

1. **Package Manager Check** - Blocks npm/yarn usage
2. **Node.js Version Check** - Ensures Node 20+
3. **Automatic Build** - Builds workspace packages after install

### Configuration Files

- **`.nvmrc`** - Locks Node.js to version 20.11.0
- **`.npmrc`** - Configures pnpm behavior
- **`package.json` engines** - Enforces version requirements
- **`package.json` packageManager** - Locks pnpm to 8.15.0

## Troubleshooting

### ❌ "Please use pnpm instead of npm"

You tried to install with npm or yarn. Use pnpm:
```bash
npm install -g pnpm@8.15.0
pnpm install
```

### ❌ "Node.js version 20.x or higher is required"

Your Node.js is too old. Update to v20:
```bash
# With nvm
nvm install 20
nvm use 20

# Or download from nodejs.org
```

### ❌ "Cannot find module '@privid/sdk'"

The workspace packages aren't built:
```bash
pnpm build
```

### ⚠️ "Port 3000 already in use"

Kill the process using port 3000:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Then restart
pnpm dev
```

### ⚠️ "Privy App ID not found"

Configure your environment:
```bash
# Make sure .env.local exists
ls -la .env.local

# Check it has the required variable
cat .env.local | grep PRIVY_APP_ID
```

Get your Privy App ID from [dashboard.privy.io](https://dashboard.privy.io/)

## Development Workflow

### Starting Fresh

```bash
# Clean everything
pnpm clean

# Reinstall and rebuild
pnpm setup
```

### Updating Dependencies

```bash
# Update all dependencies
pnpm update -r

# Rebuild packages
pnpm build
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm -F @privid/sdk test
pnpm -F @privid/contracts test

# E2E tests
pnpm -F web test:e2e
```

## For Contributors

When contributing to PrivID:

1. **Never commit `.env.local`** - Contains secrets
2. **Use pnpm only** - npm/yarn will be blocked
3. **Run `pnpm verify`** before submitting PR
4. **Follow the monorepo structure** - Keep packages independent

## CI/CD Notes

In CI environments, the postinstall script is automatically skipped. Run builds manually:

```bash
# CI build commands
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

## Getting Help

- **Setup Issues**: Run `pnpm verify` for diagnostics
- **Documentation**: See [SETUP.md](./SETUP.md) for detailed setup
- **Quick Start**: See [QUICKSTART.md](./QUICKSTART.md) for 5-minute setup
- **Issues**: [GitHub Issues](https://github.com/yourusername/privid/issues)

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| Disk Space | 2 GB | 5 GB+ |
| OS | macOS 10.15+, Ubuntu 20.04+, Windows 10+ | Latest |
| Internet | Required | Broadband |

---

**Next Steps**: After installation, see [QUICKSTART.md](./QUICKSTART.md) for your first steps with PrivID.


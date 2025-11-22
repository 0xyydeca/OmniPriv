# OmniPriv Quick Reference

Quick commands and info for developers.

## Version Requirements (Strict)

```
Node.js:  20.11.0 (or any 20.x)
pnpm:     8.15.0 (exact)
Git:      Latest
```

## Essential Commands

### First Time Setup
```bash
git clone https://github.com/yourusername/omnipriv.git
cd omnipriv
nvm use                           # Use Node 20.11.0
npm install -g pnpm@8.15.0        # Install exact pnpm version
pnpm setup                        # Install + build everything
cp .env.example .env.local        # Configure environment
pnpm verify                       # Verify setup
pnpm dev                          # Start development
```

### Daily Development
```bash
pnpm dev                          # Start dev server (localhost:3000)
pnpm build                        # Build all packages
pnpm test                         # Run all tests
pnpm lint                         # Check code style
pnpm verify                       # Verify environment
```

### Contract Development
```bash
pnpm hardhat:compile              # Compile Solidity
pnpm hardhat:test                 # Test contracts
pnpm hardhat:deploy --network baseSepolia    # Deploy to Base Sepolia
pnpm hardhat:deploy --network celoAlfajores  # Deploy to Celo Alfajores
```

### Troubleshooting
```bash
pnpm verify                       # Check what's wrong
rm -rf node_modules && pnpm setup # Clean reinstall
```

## Project Structure

```
omnipriv/
├── apps/
│   └── web/              → Next.js app (localhost:3000)
├── packages/
│   ├── contracts/        → Solidity contracts
│   ├── sdk/              → TypeScript SDK
│   └── circuits/         → Noir ZK circuits
├── scripts/              → Setup & build scripts
└── docs/                 → Documentation
```

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| "Please use pnpm instead of npm" | `npm install -g pnpm@8.15.0` |
| "Cannot find module @omnipriv/sdk" | `pnpm build` |
| "Port 3000 already in use" | `lsof -ti:3000 \| xargs kill -9` |
| "Node.js version 20.x required" | `nvm install 20 && nvm use 20` |
| "Privy App ID not found" | Edit `.env.local` with API key |

## Environment Variables

**Required for full functionality:**
```env
NEXT_PUBLIC_PRIVY_APP_ID=...      # From dashboard.privy.io
```

**Optional (for deployment):**
```env
DEPLOYER_PRIVATE_KEY=...          # For contract deployment
BASE_SEPOLIA_RPC_URL=...          # RPC endpoint
CELO_ALFAJORES_RPC_URL=...        # RPC endpoint
```

See `.env.example` for all variables.

## Git Workflow

```bash
git checkout -b feature/your-feature    # Create branch
# Make changes
pnpm test                               # Test
pnpm lint                               # Lint
git add .
git commit -m "feat: your feature"      # Conventional commits
git push origin feature/your-feature    # Push
# Create PR on GitHub
```

## Testing

```bash
pnpm test                         # All tests
pnpm -F @omnipriv/sdk test         # SDK tests only
pnpm -F @omnipriv/contracts test   # Contract tests only
pnpm -F web test:e2e             # E2E tests
```

## Useful Links

- **Docs:** [docs/](./docs/)
- **Setup Guide:** [INSTALL.md](./INSTALL.md)
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **LayerZero Demo:** [docs/LAYERZERO_DEMO.md](./docs/LAYERZERO_DEMO.md)

## Testnet Faucets

- **Base Sepolia:** https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Celo Alfajores:** https://faucet.celo.org/alfajores
- **Ethereum Sepolia:** https://sepoliafaucet.com/

## Package Scripts Explained

| Script | What It Does |
|--------|--------------|
| `pnpm setup` | Install deps + build packages (first time) |
| `pnpm verify` | Check Node/pnpm versions, deps, builds |
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build all workspace packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Check code style |
| `pnpm clean` | Remove node_modules and build artifacts |

## When Things Go Wrong

1. **Run verification:**
   ```bash
   pnpm verify
   ```

2. **Check the output** - it will tell you exactly what's wrong

3. **If still stuck:**
   ```bash
   rm -rf node_modules
   pnpm setup
   pnpm verify
   ```

4. **Still broken?** See [INSTALL.md](./INSTALL.md) troubleshooting section

## Code Style

- **TypeScript:** Strict mode, explicit types
- **React:** Functional components + hooks
- **Solidity:** 0.8.24+, custom errors, NatSpec comments
- **Commits:** Conventional commits (feat:, fix:, docs:, etc.)

## Need Help?

1. Run `pnpm verify` for diagnostics
2. Check [INSTALL.md](./INSTALL.md) troubleshooting
3. Search [GitHub Issues](https://github.com/yourusername/omnipriv/issues)
4. Open a new issue with error details

---

**Pro Tips:**
- Use `nvm use` to automatically switch to correct Node version
- Run `pnpm verify` before starting work each day
- Keep `.env.local` updated with latest contract addresses
- Use `pnpm dev` for hot reload during development
- Run tests before committing: `pnpm test`

**Happy coding! 🚀**


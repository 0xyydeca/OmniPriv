# Hardhat Deployment Guide

## ⚠️ Common Error
**Error HH1: You are not inside a Hardhat project**

This error occurs when trying to run Hardhat commands from the wrong directory.
Hardhat must be run from the `packages/contracts/` directory.

## ✅ Correct Deployment Commands

### Option 1: From Project Root (Recommended)
```bash
cd packages/contracts
pnpm deploy:baseSepolia
```

### Option 2: Using Root Script
```bash
# From project root
cd packages/contracts
pnpm deploy --network baseSepolia
```

### Option 3: Direct Hardhat Command
```bash
cd packages/contracts
npx hardhat deploy --network baseSepolia
```

## 📍 Directory Structure
- ✅ Hardhat project: `packages/contracts/`
- ❌ Frontend app: `apps/web/` (DO NOT run Hardhat from here)

## 🔍 Quick Check
To verify you're in the right directory:
```bash
ls hardhat.config.ts  # Should show the file
pwd                    # Should show: .../packages/contracts
```

## 🚀 Available Networks
- `baseSepolia` - Base Sepolia testnet (chainId: 84532)
- `optimismSepolia` - Optimism Sepolia testnet (chainId: 11155420)

## 📝 Prerequisites
Before deploying, ensure `.env` in `packages/contracts/` has:
- `DEPLOYER_PRIVATE_KEY` - Your deployer wallet private key
- `BASE_SEPOLIA_RPC_URL` - RPC URL for Base Sepolia (optional, has default)

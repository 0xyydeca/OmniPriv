import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-viem';
import 'hardhat-deploy';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from packages/contracts directory
// This ensures it works regardless of where the command is run from
// Try to get the directory where this config file is located
let contractsDir: string;
try {
  // CommonJS context (when running from contracts directory)
  contractsDir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(__filename);
} catch {
  // ES module context or when __dirname is not available
  // Fall back to process.cwd() and look for packages/contracts
  const cwd = process.cwd();
  if (cwd.endsWith('packages/contracts')) {
    contractsDir = cwd;
  } else {
    contractsDir = path.resolve(cwd, 'packages/contracts');
  }
}

const envPath = path.resolve(contractsDir, '.env');
dotenv.config({ path: envPath });

// Also try to load from root .env.local (for shared variables)
const rootEnvPath = path.resolve(contractsDir, '../../.env.local');
dotenv.config({ path: rootEnvPath, override: false }); // Don't override, just add missing vars

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      chainId: 84532,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    optimismSepolia: {
      url:
        process.env.OPTIMISM_SEPOLIA_RPC_URL ||
        'https://sepolia.optimism.io',
      chainId: 11155420,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || '',
      optimismSepolia: process.env.OPTIMISM_ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
      {
        network: 'optimismSepolia',
        chainId: 11155420,
        urls: {
          apiURL: 'https://api-sepolia-optimistic.etherscan.io/api',
          browserURL: 'https://sepolia-optimism.etherscan.io',
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    deploy: './deploy',
  },
};

export default config;


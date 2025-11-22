import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-viem';
import 'hardhat-deploy';
import 'dotenv/config';

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
    celoSepolia: {
      url:
        process.env.CELO_SEPOLIA_RPC_URL ||
        'https://forno.celo-sepolia.celo-testnet.org/',
      chainId: 11142220,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      timeout: 60000,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || '',
      celoSepolia: process.env.CELOSCAN_API_KEY || '',
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
        network: 'celoSepolia',
        chainId: 11142220,
        urls: {
          apiURL: 'https://api-alfajores.celoscan.io/api',
          browserURL: 'https://alfajores.celoscan.io',
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


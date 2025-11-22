import { http, createConfig } from 'wagmi';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';
import { baseSepolia, celoAlfajores } from 'wagmi/chains';

const connectors = [
  coinbaseWallet({
    appName: 'OmniPriv',
    appLogoUrl: '/logo.png',
  }),
  injected(),
  metaMask(),
];

// Only add WalletConnect if project ID is provided
if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  connectors.push(
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    })
  );
}

export const config = createConfig({
  chains: [baseSepolia, celoAlfajores],
  connectors,
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    ),
    [celoAlfajores.id]: http(
      process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL ||
        'https://alfajores-forno.celo-testnet.org'
    ),
  },
});


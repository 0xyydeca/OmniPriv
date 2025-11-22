import { http, createConfig } from 'wagmi';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';
import { baseSepolia, celoAlfajores, optimismSepolia } from 'wagmi/chains';

// Build connectors array
const connectors = [
  coinbaseWallet({
    appName: 'OmniPriv',
    appLogoUrl: '/logo.png',
  }),
  injected(),
  metaMask(),
];

// TODO: Fix WalletConnect connector type mismatch
// Only add WalletConnect if project ID is provided
// if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
//   connectors.push(
//     walletConnect({
//       projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
//     })
//   );
// }

export const config = createConfig({
  chains: [baseSepolia, optimismSepolia, celoAlfajores],
  connectors,
  ssr: true, // Enable SSR support
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    ),
    [optimismSepolia.id]: http(
      process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io'
    ),
    [celoAlfajores.id]: http(
      process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC_URL ||
        'https://alfajores-forno.celo-testnet.org'
    ),
  },
});


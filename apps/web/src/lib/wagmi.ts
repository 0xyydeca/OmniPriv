import { http, createConfig } from 'wagmi';
import { baseSepolia, celoAlfajores } from 'wagmi/chains';

export const config = createConfig({
  chains: [baseSepolia, celoAlfajores],
  transports: {
    [baseSepolia.id]: http(
      process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    ),
    [celoAlfajores.id]: http(
      process.env.CELO_ALFAJORES_RPC_URL ||
        'https://alfajores-forno.celo-testnet.org'
    ),
  },
});


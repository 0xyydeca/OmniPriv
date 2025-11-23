import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers, network } from 'hardhat';
import { IdentityOApp } from '../typechain-types';

/**
 * Redeploy IdentityOApp with correct LayerZero endpoint addresses
 * 
 * Usage:
 *   pnpm hardhat run scripts/redeploy-identity-oapp.ts --network baseSepolia
 *   pnpm hardhat run scripts/redeploy-identity-oapp.ts --network optimismSepolia
 */

const LZ_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6edce65403992e310a9a90612852c3b42d1a5e11', // Base Sepolia testnet
  optimismSepolia: '0x3c2269811836af69497e5f486a85d7316753cf62', // Optimism Sepolia testnet
};

const ENDPOINT_IDS: Record<string, number> = {
  baseSepolia: 40245,
  optimismSepolia: 40232,
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name as keyof typeof LZ_ENDPOINTS;

  if (!LZ_ENDPOINTS[networkName]) {
    throw new Error(`Unknown network: ${networkName}. Supported: ${Object.keys(LZ_ENDPOINTS).join(', ')}`);
  }

  const endpoint = LZ_ENDPOINTS[networkName];
  const eid = ENDPOINT_IDS[networkName];

  console.log('\n🚀 Redeploying IdentityOApp with correct LayerZero endpoint...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Network: ${networkName}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`LayerZero Endpoint: ${endpoint}`);
  console.log(`Endpoint ID (EID): ${eid}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Deploy IdentityOApp
  const IdentityOAppFactory = await ethers.getContractFactory('IdentityOApp');
  const identityOApp = await IdentityOAppFactory.deploy(endpoint, deployer.address);
  await identityOApp.waitForDeployment();

  const address = await identityOApp.getAddress();
  console.log(`✅ IdentityOApp deployed to: ${address}`);

  // Verify endpoint
  const deployedEndpoint = await identityOApp.endpoint();
  console.log(`✅ Verified endpoint: ${deployedEndpoint}`);
  if (deployedEndpoint.toLowerCase() !== endpoint.toLowerCase()) {
    console.error(`❌ ERROR: Endpoint mismatch! Expected ${endpoint}, got ${deployedEndpoint}`);
    process.exit(1);
  }

  console.log('\n📝 Next steps:');
  console.log(`1. Update deployments.json with new address: ${address}`);
  console.log(`2. Set IDENTITY_OAPP_${networkName.toUpperCase()}=${address} in .env`);
  console.log(`3. Run setPeers script on both chains after both are redeployed`);
  console.log(`4. Update cross-chain-send.ts with new contract addresses`);

  return address;
}

main()
  .then((address) => {
    console.log(`\n✅ Deployment complete! Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });


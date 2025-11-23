import { ethers, network } from 'hardhat';
import { IdentityOApp } from '../typechain-types';

/**
 * Verify LayerZero endpoint configuration for deployed IdentityOApp
 * 
 * Usage:
 *   IDENTITY_OAPP_BASE_SEPOLIA=0x... pnpm hardhat run scripts/verify-endpoint.ts --network baseSepolia
 */

const EXPECTED_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6edce65403992e310a9a90612852c3b42d1a5e11',
  optimismSepolia: '0x3c2269811836af69497e5f486a85d7316753cf62',
};

async function main() {
  const networkName = network.name as keyof typeof EXPECTED_ENDPOINTS;
  const contractAddress = process.env[`IDENTITY_OAPP_${networkName.toUpperCase()}`];

  if (!contractAddress) {
    throw new Error(
      `Please set IDENTITY_OAPP_${networkName.toUpperCase()} environment variable`
    );
  }

  if (!EXPECTED_ENDPOINTS[networkName]) {
    throw new Error(`Unknown network: ${networkName}`);
  }

  const expectedEndpoint = EXPECTED_ENDPOINTS[networkName];

  console.log('\n🔍 Verifying LayerZero Endpoint Configuration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Network: ${networkName}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Expected Endpoint: ${expectedEndpoint}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const identityOApp = await ethers.getContractAt('IdentityOApp', contractAddress) as IdentityOApp;

  // Check endpoint
  const actualEndpoint = await identityOApp.endpoint();
  console.log(`📍 Actual Endpoint: ${actualEndpoint}`);

  if (actualEndpoint.toLowerCase() === expectedEndpoint.toLowerCase()) {
    console.log('✅ Endpoint address is CORRECT!');
  } else {
    console.log('❌ Endpoint address is INCORRECT!');
    console.log(`   Expected: ${expectedEndpoint}`);
    console.log(`   Actual:   ${actualEndpoint}`);
    process.exit(1);
  }

  // Check owner
  const owner = await identityOApp.owner();
  console.log(`👤 Owner: ${owner}`);

  console.log('\n✅ Verification complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


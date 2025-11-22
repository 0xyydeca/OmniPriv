import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

/**
 * LayerZero V2 Endpoint addresses
 * See: https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
 */
const LZ_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f',
  optimismSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f',
  hardhat: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Mock for local testing
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('\n========================================');
  console.log('Deploying OmniPrivVerifier (Chain B Receiver)');
  console.log('========================================');
  console.log('Deployer:', deployer);
  console.log('Network:', network.name);

  const endpoint =
    LZ_ENDPOINTS[network.name] || LZ_ENDPOINTS.optimismSepolia;

  console.log('LayerZero Endpoint:', endpoint);

  const omniPrivVerifier = await deploy('OmniPrivVerifier', {
    from: deployer,
    args: [endpoint, deployer],
    log: true,
    waitConfirmations: network.name === 'hardhat' ? 1 : 2,
  });

  console.log('\n✅ OmniPrivVerifier deployed to:', omniPrivVerifier.address);
  console.log('\n📝 Next steps:');
  console.log('1. Set trusted peer from IdentityOApp (Chain A) to this contract');
  console.log('2. Set trusted peer from this contract to IdentityOApp (Chain A)');
  console.log('3. Run: pnpm hardhat run scripts/setPeers.ts --network optimismSepolia');
  console.log('========================================\n');
};

export default func;
func.tags = ['OmniPrivVerifier', 'ChainB'];
// Only deploy on Optimism Sepolia (Chain B) by default
func.skip = async (hre) => {
  return hre.network.name === 'baseSepolia'; // Skip on Chain A
};


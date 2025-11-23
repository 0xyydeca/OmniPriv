import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// LayerZero v2 Endpoint addresses for testnets
// Verified: 0x6EDCE65403992e310A62460808c4b910D972f10f has code on Base Sepolia (verified on-chain)
// The address 0x6edce65403992e310a9a90612852c3b42d1a5e11 has no code (invalid)
const LZ_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Base Sepolia testnet (verified)
  optimismSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Optimism Sepolia - verify separately
  hardhat: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Mock for local testing
};

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying IdentityOApp with deployer:', deployer);
  console.log('Network:', network.name);

  const endpoint =
    LZ_ENDPOINTS[network.name] || LZ_ENDPOINTS.baseSepolia;

  const identityOApp = await deploy('IdentityOApp', {
    from: deployer,
    args: [endpoint, deployer],
    log: true,
    waitConfirmations: 1,
  });

  console.log('IdentityOApp deployed to:', identityOApp.address);
};

export default func;
func.tags = ['IdentityOApp'];


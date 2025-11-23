import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// LayerZero v2 Endpoint addresses for testnets
// Verified on-chain: 0x6EDCE65403992e310A62460808c4b910D972f10f has code on both Base Sepolia and Optimism Sepolia
// Base Sepolia EID: 40245
// Optimism Sepolia EID: 40232
// Both testnets use the same endpoint address (verified on-chain)
const LZ_ENDPOINTS: Record<string, string> = {
  baseSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Base Sepolia testnet (verified - has code)
  optimismSepolia: '0x6EDCE65403992e310A62460808c4b910D972f10f', // Optimism Sepolia testnet (verified - has code)
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


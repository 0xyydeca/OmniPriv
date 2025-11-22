import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying VaultAnchor with deployer:', deployer);

  const vaultAnchor = await deploy('VaultAnchor', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });

  console.log('VaultAnchor deployed to:', vaultAnchor.address);
};

export default func;
func.tags = ['VaultAnchor'];


import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying ProofConsumer with deployer:', deployer);

  const vaultAnchor = await get('VaultAnchor');

  const proofConsumer = await deploy('ProofConsumer', {
    from: deployer,
    args: [vaultAnchor.address],
    log: true,
    waitConfirmations: 1,
  });

  console.log('ProofConsumer deployed to:', proofConsumer.address);
};

export default func;
func.tags = ['ProofConsumer'];
func.dependencies = ['VaultAnchor'];


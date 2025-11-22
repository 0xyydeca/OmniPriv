import { ethers, network } from 'hardhat';
import { IdentityOApp } from '../typechain-types';

/**
 * LayerZero Endpoint IDs
 * See: https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
 */
const ENDPOINT_IDS = {
  baseSepolia: 40245,
  optimismSepolia: 40232, // Optimism Sepolia testnet
};

/**
 * Deployed contract addresses
 * Update these after deploying to each chain
 */
const DEPLOYED_CONTRACTS = {
  baseSepolia: process.env.IDENTITY_OAPP_BASE_SEPOLIA || '',
  optimismSepolia: process.env.IDENTITY_OAPP_OPTIMISM_SEPOLIA || '',
};

/**
 * Set trusted peers for cross-chain messaging
 * Must be run on BOTH chains after deployment
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('\n🔗 Setting up LayerZero trusted peers...');
  console.log('Network:', network.name);
  console.log('Deployer:', deployer.address);
  
  // Get the current chain's contract
  const currentChain = network.name as keyof typeof DEPLOYED_CONTRACTS;
  const currentAddress = DEPLOYED_CONTRACTS[currentChain];
  
  if (!currentAddress) {
    throw new Error(`No contract address found for ${currentChain}. Set IDENTITY_OAPP_${currentChain.toUpperCase()} env var.`);
  }
  
  console.log('\nCurrent contract:', currentAddress);
  
  const identityOApp = await ethers.getContractAt('IdentityOApp', currentAddress) as IdentityOApp;
  
  // Set peers for all other chains
  const otherChains = Object.keys(DEPLOYED_CONTRACTS).filter(
    (chain) => chain !== currentChain
  ) as Array<keyof typeof DEPLOYED_CONTRACTS>;
  
  for (const otherChain of otherChains) {
    const peerAddress = DEPLOYED_CONTRACTS[otherChain];
    const peerEid = ENDPOINT_IDS[otherChain];
    
    if (!peerAddress) {
      console.log(`\n⚠️  Skipping ${otherChain}: no contract address found`);
      continue;
    }
    
    console.log(`\n📡 Setting peer for ${otherChain}...`);
    console.log(`   EID: ${peerEid}`);
    console.log(`   Address: ${peerAddress}`);
    
    // Convert address to bytes32 format
    const peerBytes32 = ethers.zeroPadValue(peerAddress, 32);
    
    try {
      const tx = await identityOApp.setPeer(peerEid, peerBytes32);
      console.log(`   Transaction: ${tx.hash}`);
      
      await tx.wait();
      console.log(`   ✅ Peer set successfully!`);
      
      // Verify
      const setPeer = await identityOApp.peers(peerEid);
      console.log(`   Verified peer: ${setPeer}`);
      
    } catch (error: any) {
      console.error(`   ❌ Failed to set peer: ${error.message}`);
    }
  }
  
  console.log('\n✅ Done! Peers configured for', currentChain);
  console.log('\n⚠️  IMPORTANT: Run this script on ALL chains for bidirectional messaging!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


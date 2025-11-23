import { ethers } from 'hardhat';

async function checkPeers() {
  const BASE_IDENTITY_OAPP = '0x89C6d0D3782a2E5556EfaDE40361D2864a6b3275';
  const OPTIMISM_SEPOLIA_EID = 40232;
  const EXPECTED_PEER = '0x591A2902FB1853A0fca20b163a63720b7579B473'; // Optimism IdentityOApp

  console.log('\n🔍 Checking LayerZero peer setup on Base Sepolia...\n');
  
  const identityOApp = await ethers.getContractAt('IdentityOApp', BASE_IDENTITY_OAPP);
  
  const peerBytes32 = await identityOApp.peers(OPTIMISM_SEPOLIA_EID);
  console.log('Peer (bytes32):', peerBytes32);
  
  // Convert bytes32 to address
  const peerAddress = '0x' + peerBytes32.slice(26); // Remove leading zeros
  console.log('Peer (address):', peerAddress);
  console.log('Expected:', EXPECTED_PEER);
  
  if (peerBytes32 === '0x' + '0'.repeat(64)) {
    console.log('\n❌ PEER NOT SET! This is why gas estimation fails!');
    console.log('\n🔧 Fix: Run the following command:');
    console.log('   cd packages/contracts && pnpm setPeers:baseSepolia');
  } else if (peerAddress.toLowerCase() === EXPECTED_PEER.toLowerCase()) {
    console.log('\n✅ Peer is correctly set!');
  } else {
    console.log('\n⚠️ Peer is set to WRONG address!');
    console.log('   Run: cd packages/contracts && pnpm setPeers:baseSepolia');
  }
}

checkPeers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


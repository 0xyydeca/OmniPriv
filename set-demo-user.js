#!/usr/bin/env node

const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const PROOF_CONSUMER = '0xdC98b38F092413fedc31ef42667C71907fc5350A';
const YOUR_CDP_WALLET = '0x4D9A256A2b9e594653Ed943f0B9dA47f8201f143';
const RPC = 'https://sepolia.base.org';

const ABI = [
  'function setDemoUser(address) external',
  'function demoUser() view returns (address)',
  'function demoMode() view returns (bool)'
];

async function main() {
  console.log('Setting demo user on ProofConsumer...\n');
  
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(PROOF_CONSUMER, ABI, wallet);
  
  console.log('Deployer:', wallet.address);
  console.log('Contract:', PROOF_CONSUMER);
  console.log('Demo user (CDP wallet):', YOUR_CDP_WALLET);
  console.log('');
  
  // Check current state
  const demoMode = await contract.demoMode();
  const currentDemoUser = await contract.demoUser();
  console.log('Current state:');
  console.log('  demoMode:', demoMode);
  console.log('  demoUser:', currentDemoUser);
  console.log('');
  
  if (currentDemoUser.toLowerCase() === YOUR_CDP_WALLET.toLowerCase()) {
    console.log('✓ Demo user already set correctly!');
    return;
  }
  
  // Set demo user
  console.log('Sending transaction...');
  const tx = await contract.setDemoUser(YOUR_CDP_WALLET, { gasLimit: 100000 });
  console.log('Tx hash:', tx.hash);
  console.log('Waiting for confirmation...');
  
  await tx.wait();
  console.log('✓ Transaction confirmed!');
  console.log('');
  
  // Verify
  const newDemoUser = await contract.demoUser();
  console.log('New state:');
  console.log('  demoUser:', newDemoUser);
  console.log('');
  
  if (newDemoUser.toLowerCase() === YOUR_CDP_WALLET.toLowerCase()) {
    console.log('SUCCESS! Your wallet will now bypass all checks.');
    console.log('');
    console.log('Next: Clear browser and test!');
  }
}

main().catch(console.error);


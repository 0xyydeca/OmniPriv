import { ethers } from 'ethers';

const endpoints = {
  baseSepolia: [
    '0x6EDCE65403992e310A62460808c4b910D972f10f',
    '0x6edce65403992e310a9a90612852c3b42d1a5e11',
  ],
  optimismSepolia: [
    '0x3c2269811836af69497e5f486a85d7316753cf62',
    '0x6EDCE65403992e310A62460808c4b910D972f10f',
  ],
};

async function checkEndpoints() {
  const baseProvider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const optimismProvider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');

  console.log('Checking Base Sepolia endpoints...');
  for (const addr of endpoints.baseSepolia) {
    const code = await baseProvider.getCode(addr);
    console.log(`  ${addr}: ${code.length > 2 ? '✅ HAS CODE' : '❌ NO CODE'} (${code.length} bytes)`);
  }

  console.log('\nChecking Optimism Sepolia endpoints...');
  for (const addr of endpoints.optimismSepolia) {
    const code = await optimismProvider.getCode(addr);
    console.log(`  ${addr}: ${code.length > 2 ? '✅ HAS CODE' : '❌ NO CODE'} (${code.length} bytes)`);
  }
}

checkEndpoints();

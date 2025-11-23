import { ethers } from 'ethers';

async function checkEndpoint() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const endpointAddress = '0x6edce65403992e310a9a90612852c3b42d1a5e11';
  
  const code = await provider.getCode(endpointAddress);
  console.log('Endpoint code length:', code.length);
  console.log('Is contract:', code !== '0x');
  
  if (code === '0x') {
    console.log('❌ Endpoint address has no code - might be wrong address');
  } else {
    console.log('✅ Endpoint address has code - looks valid');
  }
}

checkEndpoint();

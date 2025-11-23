/**
 * Test CDP CORS Configuration
 * 
 * This script helps diagnose CORS issues by testing the CDP API directly
 */

const CDP_API_BASE = 'https://api.cdp.coinbase.com';
const PROJECT_ID = process.env.NEXT_PUBLIC_CDP_APP_ID || 'RYuAoeCCdX3X4r7iGyuRl8lpuwFvId5Z';
const ORIGIN = 'http://localhost:3000';

async function testCDPCORS() {
  console.log('🔍 Testing CDP CORS Configuration...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Origin: ${ORIGIN}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test OPTIONS preflight request
  console.log('1. Testing OPTIONS (preflight) request...');
  try {
    const optionsResponse = await fetch(`${CDP_API_BASE}/platform/v2/embedded-wallet-api/projects/${PROJECT_ID}/auth/init`, {
      method: 'OPTIONS',
      headers: {
        'Origin': ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });

    console.log(`   Status: ${optionsResponse.status}`);
    console.log(`   Access-Control-Allow-Origin: ${optionsResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`   Access-Control-Allow-Methods: ${optionsResponse.headers.get('Access-Control-Allow-Methods')}`);
    
    if (optionsResponse.headers.get('Access-Control-Allow-Origin') === ORIGIN) {
      console.log('   ✅ CORS headers present - domain should be whitelisted');
    } else {
      console.log('   ❌ CORS headers missing or incorrect');
      console.log(`   Expected: ${ORIGIN}`);
      console.log(`   Got: ${optionsResponse.headers.get('Access-Control-Allow-Origin') || 'none'}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n2. Testing actual POST request...');
  try {
    const postResponse = await fetch(`${CDP_API_BASE}/platform/v2/embedded-wallet-api/projects/${PROJECT_ID}/auth/init`, {
      method: 'POST',
      headers: {
        'Origin': ORIGIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    console.log(`   Status: ${postResponse.status}`);
    console.log(`   Access-Control-Allow-Origin: ${postResponse.headers.get('Access-Control-Allow-Origin')}`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n💡 If CORS headers are missing:');
  console.log('   1. Verify domain in CDP Portal: http://localhost:3000 (exact match)');
  console.log('   2. Check you\'re editing the correct project');
  console.log('   3. Wait 1-5 minutes for changes to propagate');
  console.log('   4. Clear browser cache and try again');
}

testCDPCORS();

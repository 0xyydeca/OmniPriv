import { createPrivateKey } from 'crypto';

/**
 * Convert CDP Wallet Secret (base64-encoded DER) to JWK format
 * 
 * The CDP Portal provides Wallet Secrets as base64-encoded EC private keys in DER format.
 * This script converts them to JSON Web Key (JWK) format that the SDK expects.
 */

async function convertWalletSecretToJWK(base64Secret: string): Promise<string> {
  try {
    // Decode base64 to get the DER-encoded key
    const derBuffer = Buffer.from(base64Secret, 'base64');
    
    // Try to create a private key from the DER buffer
    // The base64 string is a DER-encoded EC private key (SEC1 format)
    const privateKey = createPrivateKey({
      key: derBuffer,
      format: 'der',
      type: 'sec1' // EC private key format (SEC1)
    });
    
    // Export as JWK
    const jwk = privateKey.export({
      format: 'jwk'
    });
    
    return JSON.stringify(jwk);
  } catch (error: any) {
    // If SEC1 format fails, try PKCS#8 format
    try {
      console.warn('SEC1 format failed, trying PKCS#8...', error.message);
      const derBuffer = Buffer.from(base64Secret, 'base64');
      
      const privateKey = createPrivateKey({
        key: derBuffer,
        format: 'der',
        type: 'pkcs8' // Try PKCS#8 format
      });
      
      const jwk = privateKey.export({
        format: 'jwk'
      });
      
      return JSON.stringify(jwk);
    } catch (pkcs8Error: any) {
      // Last attempt: Try wrapping in PEM format
      try {
        console.warn('PKCS#8 format failed, trying PEM wrapper...', pkcs8Error.message);
        const pemKey = `-----BEGIN PRIVATE KEY-----\n${base64Secret}\n-----END PRIVATE KEY-----`;
        
        const privateKey = createPrivateKey({
          key: pemKey,
          format: 'pem'
        });
        
        const jwk = privateKey.export({
          format: 'jwk'
        });
        
        return JSON.stringify(jwk);
      } catch (pemError: any) {
        throw new Error(`Failed to convert Wallet Secret. Tried SEC1, PKCS#8, and PEM formats. Last error: ${pemError.message}`);
      }
    }
  }
}

// Main execution
async function main() {
  const base64Secret = process.env.CDP_WALLET_SECRET || 
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgFGBFCMZYHP3+snGcl70JqR3vhF4D89TFvouSRatV3TqhRANCAAQO0W+7Ql8FXOyMoG1+Gm7BhAb9jKXVEzFt0s3WF9Wj9UktUTYK1tGojKtd4lEnSxdIbNhRqEeztiCgjY+Cf2OM';
  
  if (!base64Secret) {
    console.error('❌ CDP_WALLET_SECRET not found in environment');
    process.exit(1);
  }
  
  console.log('🔄 Converting Wallet Secret from base64 to JWK format...');
  console.log(`📝 Input length: ${base64Secret.length} characters`);
  console.log(`📝 First 50 chars: ${base64Secret.substring(0, 50)}...`);
  
  try {
    const jwk = await convertWalletSecretToJWK(base64Secret);
    
    console.log('\n✅ Conversion successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('JWK Format:');
    console.log(jwk);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Add this to your .env.local:');
    console.log(`CDP_WALLET_SECRET=${jwk}`);
    console.log('\nOr with quotes if needed:');
    console.log(`CDP_WALLET_SECRET='${jwk}'`);
    
    return jwk;
  } catch (error: any) {
    console.error('\n❌ Conversion failed:', error.message);
    console.error('\n💡 The Wallet Secret might be in a different format.');
    console.error('   Try using the base64 format directly in .env.local:');
    console.log(`   CDP_WALLET_SECRET=${base64Secret}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { convertWalletSecretToJWK };


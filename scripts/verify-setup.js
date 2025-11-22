#!/usr/bin/env node

/**
 * Setup verification script
 * Checks that the development environment is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_NODE_VERSION = 20;
const REQUIRED_PNPM_VERSION = '8.15.0';

class SetupVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0], 10);
    
    if (majorVersion >= REQUIRED_NODE_VERSION) {
      this.success.push(`Node.js ${version} ✓`);
    } else {
      this.errors.push(
        `Node.js version ${REQUIRED_NODE_VERSION}.x or higher required (current: ${version})`
      );
    }
  }

  checkPnpmVersion() {
    try {
      const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      
      if (version === REQUIRED_PNPM_VERSION) {
        this.success.push(`pnpm ${version} ✓`);
      } else {
        this.warnings.push(
          `pnpm version ${REQUIRED_PNPM_VERSION} recommended (current: ${version})`
        );
      }
    } catch {
      this.errors.push('pnpm is not installed. Run: npm install -g pnpm@8.15.0');
    }
  }

  checkEnvFile() {
    const envPath = path.join(process.cwd(), '.env.local');
    
    try {
      if (fs.existsSync(envPath)) {
        // Check if it has the required CDP keys
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const hasCDPKey = envContent.includes('NEXT_PUBLIC_CDP_API_KEY');
        const hasProjectId = envContent.includes('NEXT_PUBLIC_CDP_PROJECT_ID');
        
        if (hasCDPKey && hasProjectId) {
          const keyValue = envContent.match(/NEXT_PUBLIC_CDP_API_KEY=(.+)/);
          const projectValue = envContent.match(/NEXT_PUBLIC_CDP_PROJECT_ID=(.+)/);
          if (keyValue && keyValue[1] && keyValue[1].trim() !== 'your_cdp_api_key_here' &&
              projectValue && projectValue[1] && projectValue[1].trim() !== 'your_cdp_project_id_here') {
            this.success.push('.env.local configured ✓');
          } else {
            this.warnings.push('.env.local exists but CDP keys not set');
          }
        } else {
          this.warnings.push('.env.local exists but missing CDP configuration');
        }
      } else {
        this.warnings.push('.env.local not found (optional for demo mode)');
      }
    } catch (error) {
      // Permission error or file blocked - skip check
      this.warnings.push('.env.local check skipped (file may be restricted)');
    }
  }

  checkDependencies() {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (fs.existsSync(nodeModulesPath)) {
      this.success.push('Dependencies installed ✓');
    } else {
      this.errors.push('Dependencies not installed. Run: pnpm install');
    }
  }

  checkWorkspaceBuilds() {
    const sdkPath = path.join(process.cwd(), 'packages/sdk/dist');
    const contractsPath = path.join(process.cwd(), 'packages/contracts/dist');
    
    let built = 0;
    let total = 2;
    
    if (fs.existsSync(sdkPath)) built++;
    if (fs.existsSync(contractsPath)) built++;
    
    if (built === total) {
      this.success.push('Workspace packages built ✓');
    } else if (built > 0) {
      this.warnings.push(`Some packages need building (${built}/${total}). Run: pnpm build`);
    } else {
      this.warnings.push('Packages not built. Run: pnpm build');
    }
  }

  printResults() {
    console.log('\n🔍 OmniPriv Setup Verification\n');
    console.log('='.repeat(50));
    
    if (this.success.length > 0) {
      console.log('\n✅ Passed:\n');
      this.success.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:\n');
      this.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:\n');
      this.errors.forEach(msg => console.log(`   ${msg}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length === 0) {
      console.log('\n🎉 Setup complete! Run "pnpm dev" to start.\n');
      return true;
    } else {
      console.log('\n❌ Please fix the errors above before continuing.\n');
      return false;
    }
  }

  run() {
    this.checkNodeVersion();
    this.checkPnpmVersion();
    this.checkDependencies();
    this.checkWorkspaceBuilds();
    this.checkEnvFile();
    
    const success = this.printResults();
    process.exit(success ? 0 : 1);
  }
}

const verifier = new SetupVerifier();
verifier.run();


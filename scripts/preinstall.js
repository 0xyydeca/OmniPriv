#!/usr/bin/env node

/**
 * Preinstall script to enforce pnpm usage
 * Prevents installation with npm or yarn
 */

const REQUIRED_NODE_VERSION = '20';
const REQUIRED_PNPM_VERSION = '8.15.0';

function checkPackageManager() {
  const userAgent = process.env.npm_config_user_agent || '';
  
  if (userAgent.startsWith('yarn')) {
    console.error('\n❌ Please use pnpm instead of yarn.');
    console.error('📦 Install pnpm: npm install -g pnpm@8.15.0\n');
    process.exit(1);
  }
  
  if (userAgent.startsWith('npm')) {
    console.error('\n❌ Please use pnpm instead of npm.');
    console.error('📦 Install pnpm: npm install -g pnpm@8.15.0\n');
    process.exit(1);
  }
  
  if (!userAgent.startsWith('pnpm')) {
    console.warn('⚠️  Warning: Could not detect pnpm. Make sure you are using pnpm to install dependencies.\n');
  }
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0], 10);
  
  if (majorVersion < parseInt(REQUIRED_NODE_VERSION, 10)) {
    console.error(`\n❌ Node.js version ${REQUIRED_NODE_VERSION}.x or higher is required.`);
    console.error(`   Current version: ${currentVersion}`);
    console.error('   Download: https://nodejs.org/\n');
    process.exit(1);
  }
}

function main() {
  console.log('🔍 Checking environment...\n');
  
  checkNodeVersion();
  checkPackageManager();
  
  console.log('✅ Environment check passed!\n');
}

main();


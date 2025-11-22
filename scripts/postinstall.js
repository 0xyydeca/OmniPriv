#!/usr/bin/env node

/**
 * Postinstall script to build workspace packages
 * Only runs in root workspace, not in child packages
 */

const { execSync } = require('child_process');
const path = require('path');

function isRootWorkspace() {
  // Check if we're in the root by looking for workspace config
  const cwd = process.cwd();
  const rootMarkers = ['pnpm-workspace.yaml', 'pnpm-lock.yaml'];
  
  return rootMarkers.some(marker => {
    try {
      require('fs').statSync(path.join(cwd, marker));
      return true;
    } catch {
      return false;
    }
  });
}

function buildWorkspaces() {
  try {
    console.log('📦 Building workspace packages...\n');
    
    // Build all packages in the workspace
    execSync('pnpm -r --filter "./packages/*" build', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n✅ Workspace packages built successfully!\n');
    console.log('🚀 You can now run: pnpm dev\n');
  } catch (error) {
    console.error('\n⚠️  Warning: Failed to build some packages.');
    console.error('   You may need to run "pnpm build" manually.\n');
    // Don't exit with error, as some packages might not have build scripts
  }
}

function main() {
  // Only run in root workspace
  if (!isRootWorkspace()) {
    return;
  }
  
  // Skip in CI environments
  if (process.env.CI) {
    console.log('⏭️  Skipping postinstall in CI environment\n');
    return;
  }
  
  buildWorkspaces();
}

main();


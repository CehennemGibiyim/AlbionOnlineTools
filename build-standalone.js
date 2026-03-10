const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Albion Online Tools Standalone EXE...\n');

try {
  // Set environment variable
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
  
  // Build command
  const cmd = 'npx electron-builder --win --x64 --publish=never';
  
  console.log('Running build command...\n');
  execSync(cmd, {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  console.log('\n✅ Build completed!');
  
} catch (err) {
  console.error('\n❌ Build failed with error:');
  console.error(err.message);
  process.exit(1);
}

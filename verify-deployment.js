#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if all required files are in place for deployment
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  // Core files
  'index.html',
  'server.js',
  'main.js',
  'build-db.js',
  'package.json',
  
  // Configuration
  '.env.example',
  '.dockerignore',
  '.gitignore',
  'Dockerfile',
  'docker-compose.yml',
  'Dockerfile.dev',
  
  // Setup scripts
  'setup.sh',
  'setup.bat',
  
  // Documentation
  'README.md',
  'SETUP_GUIDE.md',
  'CONTRIBUTING.md',
  'LICENSE',
  
  // JavaScript modules
  'js/app.js',
  'js/api.js',
  'js/market.js',
  'js/killboard.js',
  'js/avalon.js',
  'js/builds.js',
  'js/settings.js',
  'js/i18n.js',
  
  // Styles
  'css/styles.css',
  'css/themes.css',
  
  // GitHub workflows
  '.github/workflows/ci-cd.yml',
];

console.log('🔍 Deployment Verification\n');
console.log('=' .repeat(50));

let allOk = true;
let completed = 0;

REQUIRED_FILES.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  
  if (exists) completed++;
  if (!exists) allOk = false;
});

console.log('=' .repeat(50));
console.log(`\n📊 Status: ${completed}/${REQUIRED_FILES.length} files present\n`);

if (allOk) {
  console.log('✅ All required files are in place!');
  console.log('\n🚀 Ready for deployment:\n');
  console.log('   Local:    npm run web');
  console.log('   Docker:   docker build -t albion-tools . && docker run -p 3000:3000 albion-tools');
  console.log('   Compose:  docker-compose up -d');
  console.log('   GitHub:   git push origin main\n');
  process.exit(0);
} else {
  console.log('⚠️  Some files are missing!');
  console.log('Please check the missing files above.\n');
  process.exit(1);
}

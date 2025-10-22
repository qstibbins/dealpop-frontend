#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUCKET_NAME = 'dealpopfrontend';
const CURRENT_SYMLINK = 'dist-current';

console.log('🚀 Starting safe deployment...');

// Check if current build exists
if (!fs.existsSync(CURRENT_SYMLINK)) {
  console.error('❌ No current build found. Run npm run build:timestamped first.');
  process.exit(1);
}

// Get the actual backup directory name
const backupDir = fs.readlinkSync(CURRENT_SYMLINK);
console.log(`📦 Deploying from: ${backupDir}`);

// Create a backup of current S3 state (if it exists)
console.log('💾 Creating S3 backup...');
try {
  execSync(`aws s3 sync s3://${BUCKET_NAME}/ s3://${BUCKET_NAME}-backup-${Date.now()}/ --delete`, { stdio: 'inherit' });
  console.log('✅ S3 backup created');
} catch (error) {
  console.log('⚠️  S3 backup failed (bucket might be empty) - continuing...');
}

// Deploy the new build
console.log('🚀 Deploying to S3...');
try {
  execSync(`aws s3 sync ${backupDir}/ s3://${BUCKET_NAME}/ --delete`, { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
  
  // Save deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    backupDir: backupDir,
    bucket: BUCKET_NAME,
    status: 'success'
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('📝 Deployment info saved to deployment-info.json');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Deployment complete!');
console.log('📋 Next steps:');
console.log('1. Test your site: https://dealpop.co/');
console.log('2. Test beta: https://dealpop.co/beta');
console.log('3. If issues, run: npm run rollback');

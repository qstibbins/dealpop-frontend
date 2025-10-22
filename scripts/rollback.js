#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUCKET_NAME = 'dealpopfrontend';

console.log('🔄 Starting rollback...');

// Check for deployment info
if (!fs.existsSync('deployment-info.json')) {
  console.error('❌ No deployment info found. Cannot rollback automatically.');
  console.log('💡 Manual rollback options:');
  console.log('1. List S3 backups: aws s3 ls s3://dealpopfrontend-backup-');
  console.log('2. Restore from backup: aws s3 sync s3://dealpopfrontend-backup-TIMESTAMP/ s3://dealpopfrontend/ --delete');
  process.exit(1);
}

const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
console.log(`📦 Rolling back deployment from: ${deploymentInfo.timestamp}`);

// List available backups
console.log('📋 Available S3 backups:');
try {
  execSync(`aws s3 ls s3://${BUCKET_NAME}-backup-`, { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  No S3 backups found');
}

// List local backups
console.log('\n📋 Available local backups:');
const localBackups = fs.readdirSync('.').filter(dir => dir.startsWith('dist-backup-'));
localBackups.forEach(backup => {
  const stats = fs.statSync(backup);
  console.log(`  ${backup} (${stats.mtime.toISOString()})`);
});

if (localBackups.length === 0) {
  console.error('❌ No local backups found');
  process.exit(1);
}

// Use the most recent backup
const latestBackup = localBackups.sort().pop();
console.log(`🔄 Rolling back to: ${latestBackup}`);

try {
  execSync(`aws s3 sync ${latestBackup}/ s3://${BUCKET_NAME}/ --delete`, { stdio: 'inherit' });
  console.log('✅ Rollback successful!');
  
  // Update deployment info
  const rollbackInfo = {
    ...deploymentInfo,
    rollbackTimestamp: new Date().toISOString(),
    rollbackFrom: latestBackup,
    status: 'rolled_back'
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(rollbackInfo, null, 2));
  
} catch (error) {
  console.error('❌ Rollback failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Rollback complete!');
console.log('📋 Test your site: https://dealpop.co/');

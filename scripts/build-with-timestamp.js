#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate timestamp for this build
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupDir = `dist-backup-${timestamp}`;

console.log(`🔄 Creating timestamped backup: ${backupDir}`);

// Copy dist to timestamped backup directory
execSync(`cp -r dist ${backupDir}`, { stdio: 'inherit' });

// Create a symlink to current build for easy reference
if (fs.existsSync('dist-current')) {
  fs.unlinkSync('dist-current');
}
fs.symlinkSync(backupDir, 'dist-current');

console.log(`✅ Backup created: ${backupDir}`);
console.log(`📁 Current build symlink: dist-current -> ${backupDir}`);
console.log(`🚀 Ready to deploy! Run: npm run deploy:safe`);

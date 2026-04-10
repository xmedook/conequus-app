#!/usr/bin/env node

/**
 * Generate build-info.json with git commit hash and build date
 * Run this script before building the app
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get the current git commit hash
  const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

  // Get the current date/time
  const buildDate = new Date().toISOString();

  // Get the branch name
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();

  const buildInfo = {
    commitHash,
    commitShort: commitHash.substring(0, 7),
    branch,
    buildDate,
  };

  // Write to build-info.json in the root
  const outputPath = path.join(__dirname, '..', 'build-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

  console.log('✓ Build info generated successfully:');
  console.log(`  Commit: ${buildInfo.commitShort} (${branch})`);
  console.log(`  Date: ${buildDate}`);
} catch (error) {
  console.error('Error generating build info:', error.message);

  // Create a fallback build-info.json
  const fallbackInfo = {
    commitHash: 'unknown',
    commitShort: 'unknown',
    branch: 'unknown',
    buildDate: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, '..', 'build-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2));

  console.log('⚠ Created fallback build-info.json');
}

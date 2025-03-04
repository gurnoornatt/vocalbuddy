#!/usr/bin/env node

/**
 * This script checks if all required environment variables are set
 * Run with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { red: (s) => `\x1b[31m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m` };

// Define required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(chalk.red('❌ .env.local file not found!'));
  console.log('Please create a .env.local file with the required environment variables:');
  requiredEnvVars.forEach(envVar => {
    console.log(`${envVar}=your_value_here`);
  });
  process.exit(1);
}

// Load environment variables from .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const [, key, value] = match;
    envVars[key.trim()] = value.trim();
  }
});

// Check if all required environment variables are set
let missingVars = false;
console.log('Checking environment variables:');

requiredEnvVars.forEach(envVar => {
  if (!envVars[envVar]) {
    console.log(`${chalk.red('❌')} ${envVar}: Missing`);
    missingVars = true;
  } else {
    const value = envVars[envVar];
    const displayValue = value.length > 10 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value;
    console.log(`${chalk.green('✓')} ${envVar}: ${displayValue}`);
  }
});

// Check for RESEND_API_KEY format
if (envVars['RESEND_API_KEY'] && !envVars['RESEND_API_KEY'].startsWith('re_')) {
  console.log(`${chalk.yellow('⚠️')} RESEND_API_KEY: Does not start with 're_', which is the expected format`);
}

// Check for APP_URL format
if (envVars['NEXT_PUBLIC_APP_URL'] && !envVars['NEXT_PUBLIC_APP_URL'].startsWith('http')) {
  console.log(`${chalk.yellow('⚠️')} NEXT_PUBLIC_APP_URL: Does not start with 'http', which is the expected format`);
}

if (missingVars) {
  console.error(chalk.red('\n❌ Some required environment variables are missing!'));
  process.exit(1);
} else {
  console.log(chalk.green('\n✓ All required environment variables are set!'));
} 
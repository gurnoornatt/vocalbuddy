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

// Load variables from different sources
const envVars = {};

// 1. Check process.env first (this will work in both local and Vercel environments)
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    envVars[envVar] = process.env[envVar];
  }
});

// 2. Check .env.local file if available (for local development)
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(chalk.green('✓ .env.local file found'));
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Only set if not already set from process.env
      if (!envVars[key.trim()]) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
} else {
  console.log(chalk.yellow('⚠️ .env.local file not found'));
  console.log('Checking for environment variables in process.env (for Vercel deployment)...');
}

// Check if all required environment variables are set
let missingVars = false;
console.log('Checking environment variables:');

requiredEnvVars.forEach(envVar => {
  if (!envVars[envVar] && !process.env[envVar]) {
    console.log(`${chalk.red('❌')} ${envVar}: Missing`);
    missingVars = true;
  } else {
    const value = envVars[envVar] || process.env[envVar];
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

// In Vercel deployment, we want to provide helpful information but not necessarily fail the build
const isVercelDeployment = process.env.VERCEL === '1';

if (missingVars) {
  if (isVercelDeployment) {
    console.log(chalk.yellow('\n⚠️ Some environment variables are missing, but continuing for Vercel deployment.'));
    console.log('Please ensure these are configured in your Vercel project settings.');
  } else {
    console.error(chalk.red('\n❌ Some required environment variables are missing!'));
    process.exit(1);
  }
} else {
  console.log(chalk.green('\n✓ All required environment variables are set!'));
} 
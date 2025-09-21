#!/usr/bin/env node

/**
 * Setup Script for Food Delivery Application
 *
 * This script helps set up the application by checking dependencies,
 * environment configuration, and database connectivity.
 *
 * Usage:
 *   node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`${description} exists`, 'success');
    return true;
  } else {
    log(`${description} missing: ${filePath}`, 'error');
    return false;
  }
}

function checkEnvironment() {
  log('\n📋 Checking Environment Configuration...', 'info');

  const envExists = checkFile('.env', 'Environment file');

  if (!envExists) {
    const exampleExists = checkFile('.env.example', 'Environment example');
    if (exampleExists) {
      log('Run: cp .env.example .env', 'warning');
      log('Then edit .env with your database credentials', 'warning');
    }
    return false;
  }

  // Check if critical environment variables are set
  require('dotenv').config();

  const requiredVars = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_DATABASE',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  // DB_PASSWORD is optional (can be empty for local development)

  let allSet = true;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log(`Environment variable ${varName} not set`, 'warning');
      allSet = false;
    }
  }

  if (allSet) {
    log('All required environment variables are set', 'success');
  }

  return allSet;
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'info');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeModulesExists = fs.existsSync('node_modules');

    if (!nodeModulesExists) {
      log('node_modules not found', 'error');
      log('Run: npm install', 'warning');
      return false;
    }

    log('Dependencies installed', 'success');
    return true;
  } catch (error) {
    log(`Error checking dependencies: ${error.message}`, 'error');
    return false;
  }
}

function checkDatabase() {
  log('\n🗄️ Checking Database Connection...', 'info');

  if (!process.env.DB_HOST) {
    log('Database configuration not found in environment', 'error');
    return false;
  }

  try {
    // Try to connect to database using the models
    const db = require('../db/models');

    return db.sequelize.authenticate()
      .then(() => {
        log('Database connection successful', 'success');
        return true;
      })
      .catch(error => {
        log(`Database connection failed: ${error.message}`, 'error');
        log('Please check your database credentials in .env', 'warning');
        return false;
      });
  } catch (error) {
    log(`Database check error: ${error.message}`, 'error');
    return false;
  }
}

function checkDirectories() {
  log('\n📁 Checking Required Directories...', 'info');

  const requiredDirs = [
    'logs',
    'db/migrations',
    'scripts'
  ];

  let allExist = true;
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      log(`Creating directory: ${dir}`, 'warning');
      try {
        fs.mkdirSync(dir, { recursive: true });
        log(`Created: ${dir}`, 'success');
      } catch (error) {
        log(`Failed to create ${dir}: ${error.message}`, 'error');
        allExist = false;
      }
    } else {
      log(`Directory exists: ${dir}`, 'success');
    }
  }

  return allExist;
}

function generateSecrets() {
  log('\n🔐 Generating Secure Secrets...', 'info');

  const crypto = require('crypto');

  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(64).toString('hex');

  log('Generated JWT Secret (64 bytes):', 'success');
  console.log(`JWT_SECRET=${jwtSecret}`);

  log('Generated Session Secret (64 bytes):', 'success');
  console.log(`SESSION_SECRET=${sessionSecret}`);

  log('\nAdd these to your .env file', 'warning');
}

async function runSetup() {
  log('🚀 Food Delivery Application Setup', 'info');
  log('=====================================', 'info');

  let setupSuccess = true;

  // Check directories first
  const dirsOk = checkDirectories();
  setupSuccess = setupSuccess && dirsOk;

  // Check dependencies
  const depsOk = checkDependencies();
  setupSuccess = setupSuccess && depsOk;

  // Check environment
  const envOk = checkEnvironment();
  setupSuccess = setupSuccess && envOk;

  // Generate secrets if needed
  if (!process.env.JWT_SECRET || !process.env.SESSION_SECRET) {
    generateSecrets();
    setupSuccess = false; // Need to update .env first
  }

  // Check database if environment is configured
  if (envOk) {
    const dbOk = await checkDatabase();
    setupSuccess = setupSuccess && dbOk;
  }

  log('\n📊 Setup Summary:', 'info');
  if (setupSuccess) {
    log('Setup completed successfully!', 'success');
    log('You can now run: npm run dev', 'success');
  } else {
    log('Setup needs attention. Please address the issues above.', 'warning');
    log('\nQuick Setup Commands:', 'info');
    console.log('1. cp .env.example .env');
    console.log('2. Edit .env with your database credentials');
    console.log('3. npm install (if needed)');
    console.log('4. npm run migrate');
    console.log('5. npm run dev');
  }

  return setupSuccess;
}

// Run setup if this script is executed directly
if (require.main === module) {
  runSetup().catch(error => {
    log(`Setup failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runSetup };
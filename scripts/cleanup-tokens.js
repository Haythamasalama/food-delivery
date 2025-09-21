#!/usr/bin/env node

/**
 * Token Cleanup Script
 *
 * This script removes expired tokens from the blacklist table.
 * Can be run manually or scheduled as a cron job.
 *
 * Usage:
 *   node scripts/cleanup-tokens.js
 *
 * Cron example (run daily at 2 AM):
 *   0 2 * * * /usr/bin/node /path/to/food-delivery/scripts/cleanup-tokens.js
 */

require('dotenv').config();
const { cleanupExpiredTokens } = require('../app/middlewares/authJwt');
const { logger } = require('../config/logger');

async function main() {
  try {
    logger.info('Starting token cleanup process...');

    const deletedCount = await cleanupExpiredTokens();

    if (deletedCount > 0) {
      logger.info(`Token cleanup completed successfully. Removed ${deletedCount} expired tokens.`);
    } else {
      logger.info('Token cleanup completed. No expired tokens found.');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Token cleanup failed:', error);
    process.exit(1);
  }
}

// Handle cleanup on process termination
process.on('SIGINT', () => {
  logger.info('Token cleanup interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('Token cleanup terminated');
  process.exit(1);
});

main();
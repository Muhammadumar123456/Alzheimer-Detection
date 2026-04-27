/**
 * =============================================================================
 * REDIS CONNECTION (ioredis)
 * =============================================================================
 * Centralized Redis connection for BullMQ and other caching needs.
 * Handles graceful reconnection and connection errors.
 * =============================================================================
 */

const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

// Define the connection object (initialized as a mock if async is disabled)
let redisConnection = {
    status: 'disabled',
    on: () => {},
    ping: async () => 'PONG', // Mock response for health checks
    quit: async () => {},      // Mock for graceful shutdown
    disconnect: () => {},      // Mock for graceful shutdown
};

if (config.useAsync) {
    const redisOptions = {
        maxRetriesPerRequest: null, // BullMQ requirement
        enableReadyCheck: false,    // Faster startup
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    };

    try {
        // Create the shared Redis instance
        redisConnection = new Redis(config.redis.url, redisOptions);

        // =============================================================================
        // EVENT LISTENERS
        // =============================================================================

        redisConnection.on('connect', () => {
            logger.info('Redis connection initiating...');
        });

        redisConnection.on('ready', () => {
            logger.info('Redis connection established successfully ✔');
        });

        redisConnection.on('error', (err) => {
            logger.error('Redis connection error:', {
                message: err.message,
                code: err.code,
            });
        });

        redisConnection.on('close', () => {
            logger.warn('Redis connection closed.');
        });

        redisConnection.on('reconnecting', () => {
            logger.info('Redis reconnecting...');
        });
    } catch (err) {
        logger.error('Fatal Redis initialization error:', err);
    }
} else {
    logger.info('System running in SYNC mode. Redis connection skipped.');
}

module.exports = redisConnection;

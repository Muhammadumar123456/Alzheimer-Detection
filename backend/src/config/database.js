/**
 * =============================================================================
 * DATABASE CONNECTION
 * =============================================================================
 * Mongoose connection to MongoDB (local or Atlas).
 * Includes retry logic, event listeners, and structured logging.
 * =============================================================================
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

/**
 * Connect to MongoDB with connection event handlers.
 * Supports both local MongoDB and MongoDB Atlas URIs.
 * Mongoose handles reconnection automatically by default.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.db.uri, {
            serverSelectionTimeoutMS: 10000, // 10s timeout for Atlas cold starts
        });

        const { host, port, name } = conn.connection;

        logger.info(`MongoDB connected successfully`);
        logger.info(`  Host:     ${host}${port ? ':' + port : ''}`);
        logger.info(`  Database: ${name}`);
        logger.info(`  State:    ${conn.connection.readyState === 1 ? 'Connected' : 'Connecting'}`);
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);

        if (error.message.includes('ECONNREFUSED')) {
            logger.error('  Hint: Is MongoDB running? For Atlas, check your connection string and IP whitelist.');
        }
        if (error.message.includes('authentication failed')) {
            logger.error('  Hint: Check your MONGODB_URI username and password.');
        }
        if (error.message.includes('getaddrinfo')) {
            logger.error('  Hint: Check your network connection or Atlas cluster hostname.');
        }

        process.exit(1);
    }
};

// =========================================================================
// CONNECTION EVENT LISTENERS
// =========================================================================

mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;

/**
 * =============================================================================
 * DATABASE CONNECTION
 * =============================================================================
 * Mongoose connection with retry logic and event listeners.
 * =============================================================================
 */

const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

/**
 * Connect to MongoDB with connection event handlers.
 * Mongoose handles reconnection automatically by default.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.db.uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unreachable
        });

        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

// --- Connection event listeners ---
mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;

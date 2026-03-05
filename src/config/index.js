/**
 * =============================================================================
 * CENTRALIZED CONFIGURATION
 * =============================================================================
 * Single source of truth for all environment variables.
 * No other module should read process.env directly.
 * =============================================================================
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from backend root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
    // --- Server ---
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    apiPrefix: process.env.API_PREFIX || '/api',

    // --- Database ---
    db: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/alzheimer_detection',
    },

    // --- Logging ---
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || './logs',
    },

    // --- CORS ---
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    // ---------------------------------------------------------------------------
    // Future phases (uncomment as needed)
    // ---------------------------------------------------------------------------
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-for-development-only',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    // upload: {
    //   dir: process.env.UPLOAD_DIR || './uploads',
    //   maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024,
    // },
    // ml: {
    //   url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    //   timeout: parseInt(process.env.ML_SERVICE_TIMEOUT, 10) || 30000,
    // },
};

// Freeze to prevent runtime mutations
module.exports = Object.freeze(config);

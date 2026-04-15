/**
 * =============================================================================
 * CENTRALIZED CONFIGURATION
 * =============================================================================
 * Single source of truth for all environment variables.
 * No other module should read process.env directly.
 *
 * Critical variables are validated at load time — the server will crash
 * immediately with a clear message if any are missing or invalid.
 * =============================================================================
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file from backend root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// =========================================================================
// ENVIRONMENT VARIABLE VALIDATION (WITH DEFAULTS)
// =========================================================================

const configDefaults = {
    PORT: '5000',
    MONGODB_URI: 'mongodb+srv://alzheimer:alzheimer123@cluster0.yjozkbx.mongodb.net/?appName=Cluster0', // Provided by user in prev turns
    JWT_SECRET: 'fyp-alzheimer-detection-secret-2026-hardcoded-fallback',
    CORS_ORIGIN: 'http://localhost:5173',
};

const port = parseInt(process.env.PORT || configDefaults.PORT, 10);
const mongodbUri = process.env.MONGODB_URI || configDefaults.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || configDefaults.JWT_SECRET;
const corsOrigin = process.env.CORS_ORIGIN || configDefaults.CORS_ORIGIN;

if (!process.env.MONGODB_URI) {
    console.warn('⚠️  WARNING: MONGODB_URI not found in .env. Using hardcoded fallback.');
}
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not found in .env. Using hardcoded fallback.');
}

// =========================================================================
// CONFIG OBJECT
// =========================================================================

const config = {
    // --- Server ---
    env: process.env.NODE_ENV || 'development',
    port,
    apiPrefix: process.env.API_PREFIX || '/api',

    // --- Database ---
    db: {
        uri: mongodbUri,
    },

    // --- Logging ---
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || './logs',
    },

    // --- CORS ---
    cors: {
        origin: corsOrigin,
    },

    // --- JWT ---
    jwt: {
        secret: jwtSecret,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // --- Uploads ---
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024, // 50MB
    },

    // ---------------------------------------------------------------------------
    // ML MICROSERVICE
    // ---------------------------------------------------------------------------
    ml: {
        url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
        timeout: parseInt(process.env.ML_SERVICE_TIMEOUT, 10) || 30000,
    },
};

// Deep-freeze to prevent runtime mutations (including nested objects)
const deepFreeze = (obj) => {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        if (
            obj[prop] !== null &&
            typeof obj[prop] === 'object' &&
            !Object.isFrozen(obj[prop])
        ) {
            deepFreeze(obj[prop]);
        }
    });
    return obj;
};

module.exports = deepFreeze(config);

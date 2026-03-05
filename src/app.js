/**
 * =============================================================================
 * EXPRESS APPLICATION SETUP
 * =============================================================================
 * Configures Express app with all global middleware and routes.
 * This file does NOT start the server — that's server.js's job.
 * =============================================================================
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { sendSuccess } = require('./utils/responseHelper');

const app = express();

// =========================================================================
// GLOBAL MIDDLEWARE
// =========================================================================

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Rate limiting
app.use(config.apiPrefix, apiLimiter);

// =========================================================================
// ROUTES
// =========================================================================

// Health check
app.get(`${config.apiPrefix}/health`, (req, res) => {
    sendSuccess(res, 200, 'API is running', {
        environment: config.env,
        timestamp: new Date().toISOString(),
    });
});

// Routes
const authRoutes = require('./modules/auth/auth.routes');

// Mount routes
app.use(`${config.apiPrefix}/auth`, authRoutes);

// =========================================================================
// 404 HANDLER — must be after all routes
// =========================================================================

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404));
});

// =========================================================================
// GLOBAL ERROR HANDLER — must be last middleware
// =========================================================================

app.use(errorHandler);

module.exports = app;

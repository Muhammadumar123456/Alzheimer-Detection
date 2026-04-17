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
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const logger = require('./config/logger');
const { apiLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { sendSuccess } = require('./utils/responseHelper');

const app = express();

// =========================================================================
// SECURITY MIDDLEWARE
// =========================================================================

app.use(
    helmet({
        hsts: {
            maxAge: 365 * 24 * 60 * 60,
            includeSubDomains: true,
            preload: true,
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: config.env === 'production' ? [] : null,
            },
        },
        noSniff: true,
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
);

// CORS — allow frontend origin
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// =========================================================================
// GLOBAL MIDDLEWARE
// =========================================================================

app.use(
    morgan(config.env === 'development' ? 'dev' : 'combined', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

// Rate limiting
app.use(config.apiPrefix, apiLimiter);

// =========================================================================
// PASSPORT (Google OAuth)
// =========================================================================

app.use(passport.initialize());

const googleClientId = config.google.clientId;
const googleClientSecret = config.google.clientSecret;

if (googleClientId && googleClientSecret && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
    passport.use(
        new GoogleStrategy(
            {
                clientID: googleClientId,
                clientSecret: googleClientSecret,
                callbackURL: `${config.google.apiBaseUrl || `http://localhost:${config.port}`}${config.apiPrefix}/auth/google/callback`,
            },
            (accessToken, refreshToken, profile, done) => {
                // Pass the profile to the route handler
                done(null, profile);
            }
        )
    );
    logger.info('Google OAuth strategy configured');
} else {
    // Register a dummy strategy to prevent "Unknown authentication strategy" error
    // but return a custom error if used.
    passport.use('google', new GoogleStrategy({
        clientID: 'placeholder',
        clientSecret: 'placeholder',
        callbackURL: 'placeholder'
    }, () => {}));
    
    logger.warn('Google OAuth not fully configured. Users will see config error at runtime.');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// =========================================================================
// HEALTH CHECK
// =========================================================================

app.get(`${config.apiPrefix}/health`, async (req, res) => {
    const mongoose = require('mongoose');
    const axios = require('axios');

    // Database status
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    // ML service status
    let mlStatus = { status: 'unknown', modelsLoaded: false };
    try {
        const mlRes = await axios.get(`${config.ml.url}/health`, { timeout: 5000 });
        mlStatus = {
            status: mlRes.data?.status || 'healthy',
            modelsLoaded: mlRes.data?.models_loaded || false,
        };
    } catch {
        mlStatus = { status: 'unavailable', modelsLoaded: false };
    }

    const isHealthy = dbStatus === 'connected';
    const statusCode = isHealthy ? 200 : 503;

    sendSuccess(res, statusCode, isHealthy ? 'API is healthy' : 'API is degraded', {
        environment: config.env,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus,
        mlService: mlStatus,
    });
});

// =========================================================================
// ROUTES
// =========================================================================

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const cognitiveRoutes = require('./modules/cognitive/cognitive.routes');
const resultsRoutes = require('./modules/results/results.routes');
const reportRoutes = require('./modules/report/report.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const contactRoutes = require('./modules/contact/contact.routes');
const predictionRoutes = require('./modules/prediction/prediction.routes');

// Mount routes
app.use(`${config.apiPrefix}/auth`, authRoutes);
app.use(`${config.apiPrefix}/user`, userRoutes);
app.use(`${config.apiPrefix}/upload`, uploadLimiter, uploadRoutes);
app.use(`${config.apiPrefix}/cognitive`, cognitiveRoutes);
app.use(`${config.apiPrefix}/results`, resultsRoutes);
app.use(`${config.apiPrefix}/report`, reportRoutes);
app.use(`${config.apiPrefix}/admin`, adminRoutes);
app.use(`${config.apiPrefix}/contact`, contactRoutes);
app.use(`${config.apiPrefix}/predict`, predictionRoutes);

// =========================================================================
// 404 HANDLER
// =========================================================================

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl}`, 404));
});

// =========================================================================
// GLOBAL ERROR HANDLER
// =========================================================================

app.use(errorHandler);

module.exports = app;

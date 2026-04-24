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
const compression = require('compression');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const logger = require('./config/logger');
const { apiLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { sendSuccess } = require('./utils/responseHelper');

const app = express();

// =========================================================================
// SECURITY & PERFORMANCE MIDDLEWARE
// =========================================================================

// Trust proxy (needed for rate limiting behind load balancers/proxies)
app.set('trust proxy', 1);

// Set security HTTP headers
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
                imgSrc: ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
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

// Compression for faster response times
app.use(compression());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rate limiting
app.use(config.apiPrefix, apiLimiter);

// =========================================================================
// PASSPORT (Google OAuth)
// =========================================================================

app.use(passport.initialize());

const googleClientId = config.google.clientId;
const googleClientSecret = config.google.clientSecret;

// DEBUG LOGS (Remove after fix)
console.log('[DEBUG] Google Client ID detected:', googleClientId ? `Exists (${googleClientId.substring(0, 10)}...)` : 'MISSING');
console.log('[DEBUG] Google Client Secret detected:', googleClientSecret ? 'Exists' : 'MISSING');

if (googleClientId && googleClientSecret && 
    googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && 
    googleClientId !== 'REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID') {
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
    
    logger.warn(`Google OAuth not fully configured. ID: ${googleClientId}, Secret: ${googleClientSecret ? 'SET' : 'NOT SET'}`);
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// HEALTH CHECK handled via router below

// =========================================================================
// ROUTES
// =========================================================================

const authRoutes = require('./modules/auth/auth.routes');
const healthRoutes = require('./modules/health/health.routes');
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
app.use(`${config.apiPrefix}/health`, healthRoutes);
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

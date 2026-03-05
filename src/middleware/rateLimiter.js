/**
 * =============================================================================
 * RATE LIMITER MIDDLEWARE
 * =============================================================================
 * Prevents abuse by limiting the number of requests per IP.
 * =============================================================================
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many requests. Please try again later.',
        },
    },
});

/**
 * Stricter limiter for auth routes (Phase 1).
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many login attempts. Please try again later.',
        },
    },
});

module.exports = { apiLimiter, authLimiter };

/**
 * =============================================================================
 * RATE LIMITER MIDDLEWARE
 * =============================================================================
 * Prevents abuse by limiting the number of requests per IP.
 * Different limits for general API and authentication routes.
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
 * Stricter limiter for auth routes.
 * 5 requests per 15 minutes per IP for login/register.
 * Helps prevent brute-force attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts. Please try again later.',
        },
    },
});

/**
 * Upload rate limiter.
 * 100 uploads per 15 minutes per IP.
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many upload requests. Please try again later.',
        },
    },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };

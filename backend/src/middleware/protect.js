/**
 * =============================================================================
 * PROTECT MIDDLEWARE (JWT Authentication)
 * =============================================================================
 * Verifies JWT token from the Authorization header.
 * If valid, attaches decoded user data to req.user.
 * If missing or invalid, returns 401 Unauthorized.
 * =============================================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const User = require('../modules/auth/user.model');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

const protect = asyncHandler(async (req, res, next) => {
    // 1. Extract token from Authorization header
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
        logger.warn('Auth failure: No token provided', {
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
        });
        throw new AppError('Not authorized. No token provided.', 401);
    }

    // 3. Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            logger.warn('Auth failure: Token expired', {
                ip: req.ip,
                url: req.originalUrl,
            });
            throw new AppError('Token has expired. Please log in again.', 401);
        }
        if (err.name === 'JsonWebTokenError') {
            logger.warn('Auth failure: Invalid token', {
                ip: req.ip,
                url: req.originalUrl,
            });
            throw new AppError('Invalid token. Please log in again.', 401);
        }
        logger.warn('Auth failure: Unknown token error', {
            ip: req.ip,
            url: req.originalUrl,
            error: err.message,
        });
        throw new AppError('Authentication failed.', 401);
    }

    // 4. Check if user still exists in DB
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // 5. Attach user to request object
    req.user = currentUser;

    logger.info('Auth success', {
        userId: currentUser._id,
        method: req.method,
        url: req.originalUrl,
    });

    next();
});

module.exports = protect;

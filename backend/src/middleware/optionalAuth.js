const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../modules/auth/user.model');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Optional Authentication Middleware
 * Decodes the token if present, but doesn't block if absent.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const currentUser = await User.findById(decoded.id);
        if (currentUser) {
            req.user = currentUser;
        }
    } catch (err) {
        // Just continue without user if token is invalid
    }

    next();
});

module.exports = optionalAuth;

/**
 * =============================================================================
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * =============================================================================
 * Catches all errors forwarded via next(err) or asyncHandler.
 * Distinguishes operational errors (AppError) from programming bugs.
 * =============================================================================
 */

const config = require('../config');
const logger = require('../config/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    const isOperational = err.isOperational || false;

    // Log the error
    if (isOperational) {
        logger.warn(`Operational error: ${message}`);
    } else {
        logger.error(`Unexpected error: ${err.stack || message}`);
    }

    // In production, don't leak internal error details
    if (config.env === 'production' && !isOperational) {
        statusCode = 500;
        message = 'Something went wrong. Please try again later.';
    }

    // Handle specific Mongoose errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue).join(', ');
        message = `Duplicate value for: ${field}`;
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(config.env === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;

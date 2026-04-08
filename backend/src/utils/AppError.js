/**
 * =============================================================================
 * CUSTOM APPLICATION ERROR
 * =============================================================================
 * Base error class for all operational (expected) errors.
 * Extends native Error with HTTP status code and operational flag.
 * =============================================================================
 */

class AppError extends Error {
    /**
     * @param {string} message - Human-readable error message
     * @param {number} statusCode - HTTP status code (default 500)
     */
    constructor(message, statusCode = 500) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Capture stack trace, excluding this constructor from the trace
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;

/**
 * =============================================================================
 * RESPONSE HELPER
 * =============================================================================
 * Ensures every API response follows a consistent envelope format.
 * =============================================================================
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {*} data - Response payload
 */
const sendSuccess = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable error message
 * @param {*} details - Additional error details (validation errors, etc.)
 */
const sendError = (res, statusCode, message, details = null) => {
    const response = {
        success: false,
        error: {
            message,
        },
    };

    if (details !== null) {
        response.error.details = details;
    }

    return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };

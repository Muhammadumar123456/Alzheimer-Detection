/**
 * =============================================================================
 * ASYNC HANDLER WRAPPER
 * =============================================================================
 * Wraps async route handlers to automatically catch rejected promises
 * and forward them to Express error-handling middleware.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 * =============================================================================
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

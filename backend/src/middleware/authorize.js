/**
 * =============================================================================
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 * =============================================================================
 * Restricts route access based on user roles.
 * Must be used AFTER the protect middleware (which sets req.user).
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.get('/protected', protect, authorize('admin', 'patient'), handler);
 * =============================================================================
 */

const AppError = require('../utils/AppError');

/**
 * Returns middleware that checks if req.user.role is in the allowed list.
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new AppError('Not authorized. Please log in first.', 401)
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
                    403
                )
            );
        }

        next();
    };
};

module.exports = authorize;

/**
 * =============================================================================
 * AUTH CONTROLLER
 * =============================================================================
 * Request handlers for authentication routes.
 * Bridges API requests to the Auth Service.
 * =============================================================================
 */

const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
    const { user, token } = await authService.registerUser(req.body);

    sendSuccess(res, 201, 'User registered successfully', {
        user,
        token,
    });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
    const { user, token } = await authService.loginUser(req.body);

    sendSuccess(res, 200, 'Login successful', {
        user,
        token,
    });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
exports.me = asyncHandler(async (req, res) => {
    // Note: req.user will be populated by auth middleware in Task 4
    // For now, we assume it's there (Task 3 requirement)
    sendSuccess(res, 200, 'User profile retrieved', {
        user: req.user,
    });
});

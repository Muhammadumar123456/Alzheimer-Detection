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
    sendSuccess(res, 200, 'User profile retrieved', {
        user: req.user,
    });
});

/**
 * Change password
 * PUT /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    sendSuccess(res, 200, 'Password changed successfully');
});

/**
 * Forgot password — send reset email
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    // Always return success (don't reveal if email exists)
    sendSuccess(res, 200, 'If an account with that email exists, a password reset link has been sent.');
});

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const { user, token: jwtToken } = await authService.resetPassword(token, newPassword);

    sendSuccess(res, 200, 'Password reset successfully', {
        user,
        token: jwtToken,
    });
});


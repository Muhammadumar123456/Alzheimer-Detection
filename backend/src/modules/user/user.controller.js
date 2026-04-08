/**
 * =============================================================================
 * USER CONTROLLER
 * =============================================================================
 * Request handlers for user profile management routes.
 * Bridges API requests to the User Service.
 * =============================================================================
 */

const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');
const logger = require('../../config/logger');

/**
 * Get authenticated user's profile
 * GET /api/user/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);

    logger.info(`Profile retrieved for user: ${user.email}`);

    sendSuccess(res, 200, 'User profile retrieved successfully', { user });
});

/**
 * Update authenticated user's profile
 * PUT /api/user/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);

    sendSuccess(res, 200, 'User profile updated successfully', {
        user: updatedUser,
    });
});

/**
 * Delete authenticated user's account
 * DELETE /api/user/profile
 */
exports.deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user.id);

    sendSuccess(res, 200, 'User account deleted successfully');
});

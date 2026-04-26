/**
 * =============================================================================
 * ADMIN CONTROLLER
 * =============================================================================
 * Request handlers for admin-only routes.
 * Delegates to Admin Service for business logic.
 * =============================================================================
 */

const adminService = require('./admin.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../../utils/responseHelper');
const { parsePaginationParams } = require('../../utils/paginate');
const logger = require('../../config/logger');

/**
 * List all users — paginated
 * GET /api/admin/users
 */
exports.listUsers = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { createdAt: -1 } });
    const result = await adminService.listUsers(paginationParams);

    logger.info(`Admin ${req.user.email} listed users (page ${result.pagination.page})`);

    sendPaginated(res, 200, 'Users retrieved successfully', result, 'users');
});

/**
 * Create a new user manually
 * POST /api/admin/user
 */
exports.createUser = asyncHandler(async (req, res) => {
    const newUser = await adminService.createUser(req.body);

    logger.info(`Admin ${req.user.email} created a new user: ${newUser.email}`);

    sendSuccess(res, 201, 'User created successfully', { user: newUser });
});

/**
 * Update an existing user's details
 * PATCH /api/admin/user/:userId
 */
exports.updateUser = asyncHandler(async (req, res) => {
    const updatedUser = await adminService.updateUser(req.params.userId, req.body);

    logger.info(`Admin ${req.user.email} updated user: ${updatedUser.email} (ID: ${req.params.userId})`);

    sendSuccess(res, 200, 'User updated successfully', { user: updatedUser });
});

/**
 * Remove a user by ID (with cascade deletion)
 * DELETE /api/admin/user/:userId
 */
exports.removeUser = asyncHandler(async (req, res) => {
    const deletedUser = await adminService.removeUser(req.params.userId, req.user.id);

    logger.info(`Admin ${req.user.email} deleted user: ${deletedUser.email} (ID: ${req.params.userId})`);

    sendSuccess(res, 200, 'User removed successfully', { deletedUser });
});

/**
 * Get dashboard overview stats
 * GET /api/admin/stats
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getDashboardStats();

    logger.info(`Admin ${req.user.email} viewed dashboard stats`);

    sendSuccess(res, 200, 'Dashboard stats retrieved successfully', { stats });
});

/**
 * Get all reports (MRI + Cognitive tests)
 * GET /api/admin/reports
 */
exports.getAllReports = asyncHandler(async (req, res) => {
    const reports = await adminService.getAllReports();

    logger.info(`Admin ${req.user.email} viewed all reports`);

    sendSuccess(res, 200, 'Reports retrieved successfully', { reports });
});

/**
 * Get analytics data for charts
 * GET /api/admin/analytics
 */
exports.getAnalytics = asyncHandler(async (req, res) => {
    const { range } = req.query;
    const analytics = await adminService.getAnalytics(range);

    logger.info(`Admin ${req.user.email} viewed analytics (range: ${range || 'default'})`);

    sendSuccess(res, 200, 'Analytics retrieved successfully', { analytics });
});

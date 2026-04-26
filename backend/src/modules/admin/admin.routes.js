/**
 * =============================================================================
 * ADMIN ROUTES
 * =============================================================================
 * Route definitions for admin-only operations.
 * All routes require JWT authentication AND admin role.
 * =============================================================================
 */

const express = require('express');
const adminController = require('./admin.controller');
const protect = require('../../middleware/protect');
const authorize = require('../../middleware/authorize');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * GET    /api/admin/stats        — Dashboard overview statistics
 * GET    /api/admin/users        — List all users (paginated)
 * POST   /api/admin/user         — Create a new user manually
 * PATCH  /api/admin/user/:userId — Update user details
 * DELETE /api/admin/user/:userId — Remove a user (cascade)
 * GET    /api/admin/reports      — All reports (MRI + Cognitive + Predictions)
 * GET    /api/admin/analytics    — Chart analytics data
 */
router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.post('/user', validate(schemas.adminCreateUser), adminController.createUser);
router.patch('/user/:userId', validate(schemas.adminUpdateUser), adminController.updateUser);
router.delete('/user/:userId', adminController.removeUser);
router.get('/reports', adminController.getAllReports);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

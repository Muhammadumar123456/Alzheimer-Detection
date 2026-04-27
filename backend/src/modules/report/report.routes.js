/**
 * =============================================================================
 * REPORT ROUTES
 * =============================================================================
 * Route definitions for report generation.
 * All routes are protected — require a valid JWT.
 * /my         — patients access their own report
 * /user/:userId — admin access specific user report
 * =============================================================================
 */

const express = require('express');
const reportController = require('./report.controller');
const protect = require('../../middleware/protect');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All report routes require authentication
router.use(protect);

/**
 * GET /api/report/my            — Generate own aggregated report (any authenticated user)
 * GET /api/report/user/:userId  — Generate report for specific user (admin only)
 */
router.get('/my', reportController.getMyReport);
router.get('/user/:userId', authorize('admin'), reportController.getReportByUserId);

module.exports = router;

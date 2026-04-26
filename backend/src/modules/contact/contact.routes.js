/**
 * =============================================================================
 * CONTACT ROUTES
 * =============================================================================
 * Public route for contact form submissions.
 * =============================================================================
 */

const express = require('express');
const contactController = require('./contact.controller');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();
const protect = require('../../middleware/protect');
const authorize = require('../../middleware/authorize');
const optionalAuth = require('../../middleware/optionalAuth');

/**
 * POST /api/contact — Submit contact form (rate-limited + validated)
 * Uses optionalAuth to link to user if logged in
 */
router.post('/', optionalAuth, authLimiter, validate(schemas.contact), contactController.submitContact);

/**
 * GET /api/contact/inquiries — Get inquiries (User sees their own, Admin sees all)
 */
router.get('/inquiries', protect, contactController.getInquiries);

/**
 * PATCH /api/contact/inquiries/:id/reply — Reply to inquiry (Admin only)
 */
router.patch('/inquiries/:id/reply', protect, authorize('admin'), contactController.replyToInquiry);

module.exports = router;

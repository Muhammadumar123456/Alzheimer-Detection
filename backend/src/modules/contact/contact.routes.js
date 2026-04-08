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

const router = express.Router();

/**
 * POST /api/contact — Submit contact form (rate-limited)
 */
router.post('/', authLimiter, contactController.submitContact);

module.exports = router;

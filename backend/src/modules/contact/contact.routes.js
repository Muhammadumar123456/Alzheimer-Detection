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

/**
 * POST /api/contact — Submit contact form (rate-limited + validated)
 */
router.post('/', authLimiter, validate(schemas.contact), contactController.submitContact);

module.exports = router;

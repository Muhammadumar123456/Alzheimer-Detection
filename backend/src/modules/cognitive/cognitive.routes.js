/**
 * =============================================================================
 * COGNITIVE TEST ROUTES
 * =============================================================================
 * Route definitions for cognitive assessment operations.
 * All routes are protected — require a valid JWT.
 * /my         — patients access their own data
 * /user/:userId — admin/clinician access specific user data
 * =============================================================================
 */

const express = require('express');
const cognitiveController = require('./cognitive.controller');
const protect = require('../../middleware/protect');
const authorize = require('../../middleware/authorize');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

// All cognitive routes require authentication
router.use(protect);

/**
 * POST /api/cognitive/submit — Submit cognitive test scores
 * GET  /api/cognitive/my     — Get own cognitive test results (any authenticated user)
 * GET  /api/cognitive/user/:userId — Get specific user's results (admin/clinician only)
 */
router.post('/submit', validate(schemas.cognitiveSubmit), cognitiveController.submitTest);
router.get('/my', cognitiveController.getMyTests);
router.get('/user/:userId', authorize('admin', 'clinician'), cognitiveController.getTestsByUserId);

module.exports = router;

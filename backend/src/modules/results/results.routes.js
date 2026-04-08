/**
 * =============================================================================
 * RESULTS ROUTES (Prediction Results)
 * =============================================================================
 * Route definitions for ML prediction results.
 * All routes are protected — require a valid JWT.
 * /my         — patients access their own data
 * /user/:userId — admin/clinician access specific user data
 * =============================================================================
 */

const express = require('express');
const resultsController = require('./results.controller');
const protect = require('../../middleware/protect');
const authorize = require('../../middleware/authorize');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

// All results routes require authentication
router.use(protect);

/**
 * POST /api/results           — Store a new prediction result
 * GET  /api/results/my        — Get own prediction results (any authenticated user)
 * GET  /api/results/user/:userId — Get specific user's results (admin/clinician only)
 */
router.post('/', validate(schemas.storePrediction), resultsController.storePrediction);
router.get('/my', resultsController.getMyResults);
router.get('/user/:userId', authorize('admin', 'clinician'), resultsController.getResultsByUserId);

module.exports = router;

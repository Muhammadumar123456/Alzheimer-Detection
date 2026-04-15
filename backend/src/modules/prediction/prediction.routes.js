/**
 * =============================================================================
 * PREDICTION ROUTES (ML Integration)
 * =============================================================================
 * Route definitions for ML prediction operations.
 * All routes are protected — require a valid JWT via protect middleware.
 * =============================================================================
 */

const express = require('express');
const predictionController = require('./prediction.controller');
const protect = require('../../middleware/protect');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

// All prediction routes require authentication
router.use(protect);

/**
 * POST /api/predict        — Run multimodal ML prediction
 * GET  /api/predict/health — Check ML microservice health
 */
router.post('/', validate(schemas.predict), predictionController.predict);
router.get('/health', predictionController.mlHealth);

module.exports = router;

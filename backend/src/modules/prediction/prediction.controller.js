/**
 * =============================================================================
 * PREDICTION CONTROLLER (ML Integration)
 * =============================================================================
 * Request handlers for ML prediction routes.
 * Bridges API requests to the Prediction Service.
 * =============================================================================
 */

const predictionService = require('./prediction.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Run ML prediction
 * POST /api/predict
 */
exports.predict = asyncHandler(async (req, res) => {
    const result = await predictionService.runPrediction({
        mriScanId: req.body.mriScanId,
        cognitiveTestId: req.body.cognitiveTestId,
        userId: req.user.id,
    });

    sendSuccess(res, 201, 'Prediction completed successfully', { result });
});

/**
 * Check ML service health
 * GET /api/predict/health
 */
exports.mlHealth = asyncHandler(async (req, res) => {
    const health = await predictionService.checkMLHealth();

    const statusCode = health.status === 'healthy' ? 200 : 503;
    sendSuccess(res, statusCode, `ML service status: ${health.status}`, { health });
});

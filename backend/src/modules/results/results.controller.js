/**
 * =============================================================================
 * RESULTS CONTROLLER (Prediction Results)
 * =============================================================================
 * Request handlers for prediction result routes.
 * Bridges API requests to the Results Service.
 * =============================================================================
 */

const resultsService = require('./results.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../../utils/responseHelper');
const { parsePaginationParams } = require('../../utils/paginate');

/**
 * Store a new ML prediction result
 * POST /api/results
 */
exports.storePrediction = asyncHandler(async (req, res) => {
    const result = await resultsService.storePrediction({
        userId: req.user.id,
        mriScanId: req.body.mriScanId,
        cognitiveTestId: req.body.cognitiveTestId,
        prediction: req.body.prediction,
        confidence: req.body.confidence,
        modelVersion: req.body.modelVersion,
        details: req.body.details,
    });

    sendSuccess(res, 201, 'Prediction result stored successfully', { result });
});

/**
 * Get own prediction results (for patients) — paginated
 * GET /api/results/my
 */
exports.getMyResults = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { createdAt: -1 } });
    const result = await resultsService.getResultsByUser(req.user.id, paginationParams);

    sendPaginated(res, 200, 'Prediction results retrieved successfully', result, 'results');
});

/**
 * Get prediction results for a specific user (admin only) — paginated
 * GET /api/results/user/:userId
 */
exports.getResultsByUserId = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { createdAt: -1 } });
    const result = await resultsService.getResultsByUser(req.params.userId, paginationParams);

    sendPaginated(res, 200, 'Prediction results retrieved successfully', result, 'results');
});

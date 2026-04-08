/**
 * =============================================================================
 * COGNITIVE TEST CONTROLLER
 * =============================================================================
 * Request handlers for cognitive assessment routes.
 * Bridges API requests to the Cognitive Service.
 * =============================================================================
 */

const cognitiveService = require('./cognitive.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../../utils/responseHelper');
const { parsePaginationParams } = require('../../utils/paginate');

/**
 * Submit a cognitive test
 * POST /api/cognitive/submit
 */
exports.submitTest = asyncHandler(async (req, res) => {
    const cognitiveTest = await cognitiveService.submitTest(req.user.id, req.body);

    sendSuccess(res, 201, 'Cognitive test submitted successfully', {
        cognitiveTest,
    });
});

/**
 * Get own cognitive tests (for patients) — paginated
 * GET /api/cognitive/my
 */
exports.getMyTests = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { submittedAt: -1 } });
    const result = await cognitiveService.getTestsByUser(req.user.id, paginationParams);

    sendPaginated(res, 200, 'Cognitive tests retrieved successfully', result, 'tests');
});

/**
 * Get cognitive tests for a specific user (admin/clinician only) — paginated
 * GET /api/cognitive/user/:userId
 */
exports.getTestsByUserId = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { submittedAt: -1 } });
    const result = await cognitiveService.getTestsByUser(req.params.userId, paginationParams);

    sendPaginated(res, 200, 'Cognitive tests retrieved successfully', result, 'tests');
});

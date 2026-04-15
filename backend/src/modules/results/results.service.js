/**
 * =============================================================================
 * RESULTS SERVICE (Prediction Results)
 * =============================================================================
 * Business logic for storing and retrieving ML prediction results.
 * Supports pagination for list queries.
 * =============================================================================
 */

const Result = require('./results.model');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

/**
 * Store a new ML prediction result
 * @param {object} data - { userId, mriScanId, cognitiveTestId, prediction, confidence, modelVersion, details }
 * @returns {Promise<object>} Created result document
 */
exports.storePrediction = async (data) => {
    const {
        userId,
        mriScanId,
        cognitiveTestId,
        prediction,
        confidence,
        classProbabilities,
        processingTimeMs,
        modelVersion,
        details,
    } = data;

    const result = await Result.create({
        user: userId,
        mriScan: mriScanId,
        cognitiveTest: cognitiveTestId,
        prediction,
        confidence,
        classProbabilities,
        processingTimeMs,
        modelVersion,
        details,
    });

    logger.info(
        `Prediction stored: ${prediction} (confidence: ${confidence}) for user ${userId}`
    );

    return result;
};

/**
 * Get prediction results for a specific user with pagination
 * @param {string} userId - Mongoose User ID
 * @param {object} paginationParams - { page, limit, skip, sort }
 * @returns {Promise<{ docs: Array, pagination: object }>} Paginated results
 */
exports.getResultsByUser = async (userId, paginationParams) => {
    const result = await paginateQuery(
        Result,
        { user: userId },
        paginationParams,
        {
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'mriScan', select: 'fileName uploadedAt' },
                { path: 'cognitiveTest', select: 'rawAnswers totalScore mmseScore mocaScore memoryScore languageScore attentionScore submittedAt' },
            ],
        }
    );

    return result;
};

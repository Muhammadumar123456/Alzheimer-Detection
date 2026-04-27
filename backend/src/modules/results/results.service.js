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
 * Initialize a pending ML prediction result
 * @param {object} data - { userId, mriScanId, cognitiveTestId }
 * @returns {Promise<object>} Created pending result document
 */
exports.initiateResult = async ({ userId, mriScanId, cognitiveTestId }) => {
    const result = await Result.create({
        user: userId,
        mriScan: mriScanId,
        cognitiveTest: cognitiveTestId,
        status: 'pending'
    });

    logger.info(`Prediction initialized (pending): ${result._id} for user ${userId}`);
    return result;
};

/**
 * Update an existing result (used by workers or post-prediction)
 * @param {string} resultId - Mongoose ID of the result
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated result document
 */
exports.updateResult = async (resultId, updateData) => {
    const result = await Result.findByIdAndUpdate(
        resultId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError('Prediction result not found for update.', 404);
    }

    const populated = await result.populate([
        { path: 'user', select: 'name email' },
        { path: 'mriScan', select: 'fileName uploadedAt filePath storageType' },
        { path: 'cognitiveTest', select: 'rawAnswers totalScore mmseScore mocaScore memoryScore languageScore attentionScore submittedAt' },
    ]);

    logger.info(`Prediction updated and populated: ${resultId} (status: ${result.status})`);
    return populated;
};

/**
 * Store a new ML prediction result
 * @param {object} data - { userId, mriScanId, cognitiveTestId, prediction, confidence, status, modelVersion, details }
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
        status,
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
        status: status || 'completed',
        details,
    });

    const populated = await result.populate([
        { path: 'user', select: 'name email' },
        { path: 'mriScan', select: 'fileName uploadedAt filePath storageType' },
        { path: 'cognitiveTest', select: 'rawAnswers totalScore mmseScore mocaScore memoryScore languageScore attentionScore submittedAt' },
    ]);

    logger.info(
        `Prediction stored and populated: ${prediction} (confidence: ${confidence}, status: ${result.status}) for user ${userId}`
    );

    return populated;
};

/**
 * Get prediction results for a specific user with pagination.
 * Only returns completed predictions by default (hides pending/failed).
 * @param {string} userId - Mongoose User ID
 * @param {object} paginationParams - { page, limit, skip, sort }
 * @returns {Promise<{ docs: Array, pagination: object }>} Paginated results
 */
exports.getResultsByUser = async (userId, paginationParams) => {
    const result = await paginateQuery(
        Result,
        { user: userId, status: { $ne: 'failed' } },
        paginationParams,
        {
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'mriScan', select: 'fileName uploadedAt filePath storageType' },
                { path: 'cognitiveTest', select: 'rawAnswers totalScore mmseScore mocaScore memoryScore languageScore attentionScore submittedAt' },
            ],
        }
    );

    return result;
};

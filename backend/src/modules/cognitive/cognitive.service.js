/**
 * =============================================================================
 * COGNITIVE TEST SERVICE
 * =============================================================================
 * Business logic for cognitive assessment test operations.
 * Handles test submission and retrieval with pagination support.
 * =============================================================================
 */

const CognitiveTest = require('./cognitive.model');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

/**
 * Submit a new cognitive test result
 * @param {string} userId - Mongoose User ID
 * @param {object} testData - Cognitive test scores
 * @returns {Promise<object>} Created cognitive test document
 */
exports.submitTest = async (userId, testData) => {
    const { mmseScore, mocaScore, memoryScore, languageScore, attentionScore, notes, mriUploadId } = testData;

    const cognitiveTest = await CognitiveTest.create({
        user: userId,
        mmseScore,
        mocaScore,
        memoryScore,
        languageScore,
        attentionScore,
        notes,
        mriUpload: mriUploadId,
    });

    logger.info(`Cognitive test submitted by user ${userId} (ID: ${cognitiveTest._id})`);

    return cognitiveTest;
};

/**
 * Get cognitive tests for a specific user with pagination
 * @param {string} userId - Mongoose User ID
 * @param {object} paginationParams - { page, limit, skip, sort }
 * @returns {Promise<{ docs: Array, pagination: object }>} Paginated results
 */
exports.getTestsByUser = async (userId, paginationParams) => {
    const result = await paginateQuery(
        CognitiveTest,
        { user: userId },
        paginationParams,
        {
            populate: { path: 'user', select: 'name email' },
        }
    );

    return result;
};

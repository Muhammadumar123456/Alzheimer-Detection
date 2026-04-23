/**
 * =============================================================================
 * PREDICTION SERVICE (ML Integration)
 * =============================================================================
 * Business logic for running multimodal Alzheimer predictions.
 * Orchestrates data retrieval, ML service communication, and result storage.
 *
 * Flow:
 *   1. Fetch MRI record → read file from disk
 *   2. Fetch CognitiveTest → extract rawAnswers
 *   3. POST to FastAPI ML service (multipart/form-data)
 *   4. Store prediction in Results collection
 *   5. Return stored result
 * =============================================================================
 */

const MRI = require('../upload/mri.model');
const CognitiveTest = require('../cognitive/cognitive.model');
const resultsService = require('../results/results.service');
const mlClient = require('../../utils/mlClient');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

// =========================================================================
// ML SERVICE HEALTH CHECK
// =========================================================================

/**
 * Check whether the ML microservice is healthy and models are loaded.
 * @returns {Promise<object>} Health status from the ML service
 */
exports.checkMLHealth = async () => {
    return await mlClient.checkHealth();
};

// =========================================================================
// MAIN PREDICTION PIPELINE
// =========================================================================

/**
 * Run multimodal Alzheimer prediction using the ML microservice.
 *
 * @param {object} params
 * @param {string} params.mriScanId    - MRI document ID
 * @param {string} params.cognitiveTestId - CognitiveTest document ID
 * @param {string} params.userId       - Authenticated user's ID
 * @param {string} [params.resultId]   - Optional: Existing result ID to update (for async flow)
 * @returns {Promise<object>} Stored or updated prediction result document
 */
exports.runPrediction = async ({ mriScanId, cognitiveTestId, userId, resultId }) => {
    // ------------------------------------------------------------------
    // 1. Fetch MRI record
    // ------------------------------------------------------------------
    const mriRecord = await MRI.findById(mriScanId);
    if (!mriRecord) throw new AppError('MRI scan not found.', 404);
    if (mriRecord.user.toString() !== userId) throw new AppError('Unauthorized access to MRI.', 403);

    // ------------------------------------------------------------------
    // 2. Fetch cognitive test record
    // ------------------------------------------------------------------
    const cognitiveTest = await CognitiveTest.findById(cognitiveTestId);
    if (!cognitiveTest) throw new AppError('Cognitive test not found.', 404);
    if (cognitiveTest.user.toString() !== userId) throw new AppError('Unauthorized access to test.', 403);

    if (!cognitiveTest.rawAnswers || cognitiveTest.rawAnswers.length !== 30) {
        throw new AppError('Invalid cognitive answers.', 400);
    }

    // ------------------------------------------------------------------
    // 3. Call ML service via Shared Client
    // ------------------------------------------------------------------
    const isAsync = !!resultId;
    logger.info(`Running ML prediction (${isAsync ? 'Async' : 'Sync'}) for user: ${userId}`);
    const mlData = await mlClient.predict(mriRecord, cognitiveTest.rawAnswers);

    // ------------------------------------------------------------------
    // 4. Persist result in MongoDB
    // ------------------------------------------------------------------
    const resultPayload = {
        userId,
        mriScanId,
        cognitiveTestId,
        prediction: mlData.prediction,
        confidence: mlData.confidence,
        classProbabilities: mlData.class_probabilities,
        processingTimeMs: mlData.processing_time_ms,
        modelVersion: mlData.model_version || '1.0.0',
        status: 'completed',
        details: {
            mlServiceUrl: config.ml.url,
            rawProbabilities: mlData.class_probabilities,
            isSyncFallback: !isAsync
        },
    };

    if (resultId) {
        // Update existing record (Async Flow)
        return await resultsService.updateResult(resultId, resultPayload);
    } else {
        // Create new record (Sync Flow)
        return await resultsService.storePrediction(resultPayload);
    }
};


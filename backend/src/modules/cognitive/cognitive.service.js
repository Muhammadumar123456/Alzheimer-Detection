/**
 * =============================================================================
 * COGNITIVE TEST SERVICE
 * =============================================================================
 * Business logic for cognitive assessment test operations.
 * Handles test submission and retrieval with pagination support.
 * =============================================================================
 */

const CognitiveTest = require('./cognitive.model');
const predictionService = require('../prediction/prediction.service');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

/**
 * Submit a new cognitive test result
 *
 * Accepts rawAnswers (30 binary values) and auto-computes derived clinical
 * scores for display purposes.  Scores are INVERTED so that higher
 * percentages mean healthier (fewer symptoms reported).
 *
 * Domain-to-index mapping (must match ML training order from testing_gui.py):
 *   Memory (MOCA / ADAS-Cog)           → indices 0–7   (8 questions)
 *   Attention & Processing Speed (MOCA) → indices 8–13  (6 questions)
 *   Executive Function (ADAS-Cog)       → indices 14–19 (6 questions)
 *   Language (ADAS-Cog)                 → indices 20–23 (4 questions)
 *   Orientation (MOCA)                  → indices 24–26 (3 questions)
 *   Daily Functioning (CDRSB / ADL)     → indices 27–29 (3 questions)
 *
 * @param {string} userId - Mongoose User ID
 * @param {object} testData - { rawAnswers: number[], mriUploadId?, notes? }
 * @returns {Promise<object>} Created cognitive test document
 */
exports.submitTest = async (userId, testData) => {
    const { rawAnswers, notes, mriUploadId } = testData;

    // Helper: sum a slice of the rawAnswers array
    const sumRange = (start, end) =>
        rawAnswers.slice(start, end + 1).reduce((a, b) => a + b, 0);

    // Total symptoms reported (0 = best, 30 = worst)
    const totalScore = rawAnswers.reduce((a, b) => a + b, 0);

    // Inverted domain scores: higher % = healthier (fewer symptoms)
    const memorySymptoms    = sumRange(0, 7);    // 8 questions
    const attentionSymptoms = sumRange(8, 13);   // 6 questions
    const languageSymptoms  = sumRange(20, 23);  // 4 questions

    const memoryScore    = Math.round(((8 - memorySymptoms) / 8) * 100);
    const attentionScore = Math.round(((6 - attentionSymptoms) / 6) * 100);
    const languageScore  = Math.round(((4 - languageSymptoms) / 4) * 100);

    // MMSE/MoCA mapped to 0–30 scale (inverted: 30 = no symptoms)
    const mmseScore = 30 - totalScore;
    const mocaScore = 30 - totalScore;

    const cognitiveTest = await CognitiveTest.create({
        user: userId,
        rawAnswers,
        totalScore,
        mmseScore,
        mocaScore,
        memoryScore,
        languageScore,
        attentionScore,
        notes,
        mriUpload: mriUploadId,
    });

    logger.info(`Cognitive test submitted by user ${userId} (ID: ${cognitiveTest._id}), symptoms: ${totalScore}/30`);

    // ------------------------------------------------------------------
    // AUTO-PREDICTION
    // If an MRI scan is linked, trigger the ML prediction immediately.
    // Includes duplicate prevention — skip if a result already exists
    // for this exact MRI + cognitive test pair.
    // ------------------------------------------------------------------
    let predictionResult = null;
    if (mriUploadId) {
        logger.info(`MRI Scan ID detected (${mriUploadId}). Triggering auto-prediction for user ${userId}`);
        const Result = require('../results/results.model');

        // Duplicate guard: check if a prediction already exists for this pair
        const existingResult = await Result.findOne({
            mriScan: mriUploadId,
            cognitiveTest: cognitiveTest._id,
            status: { $in: ['completed', 'pending'] },
        }).populate('cognitiveTest');

        if (existingResult) {
            logger.info(`Skipping auto-prediction — result already exists (${existingResult._id}, status: ${existingResult.status})`);
            predictionResult = existingResult;
        } else {
            let isQueued = false;

            // ASYNC PATH (BullMQ)
            if (config.useAsync) {
                try {
                    const resultsService = require('../results/results.service');
                    const predictionQueue = require('../../queues/prediction.queue');

                    // 1. Create a pending result record
                    predictionResult = await resultsService.initiateResult({
                        userId,
                        mriScanId: mriUploadId,
                        cognitiveTestId: cognitiveTest._id,
                    });

                    // 2. Dispatch job to queue
                    await predictionQueue.add('analyze-alzheimer', {
                        mriScanId: mriUploadId,
                        cognitiveTestId: cognitiveTest._id,
                        userId,
                        resultId: predictionResult._id,
                    });

                    logger.info(`Auto-prediction job queued for test ${cognitiveTest._id}`);
                    isQueued = true;
                } catch (queueErr) {
                    logger.error(`Queue dispatch failed for test ${cognitiveTest._id}, falling back to sync: ${queueErr.message}`);
                }
            }

            // SYNC PATH (Direct Call or Fallback)
            if (!isQueued) {
                try {
                    predictionResult = await predictionService.runPrediction({
                        mriScanId: mriUploadId,
                        cognitiveTestId: cognitiveTest._id,
                        userId,
                    });
                    logger.info(`Auto-prediction successful (Sync) for test ${cognitiveTest._id}`);
                } catch (err) {
                    // Log but don't fail the request — the cognitive test is already saved!
                    logger.error(`Auto-prediction failed for test ${cognitiveTest._id}: ${err.message}`, {
                        error: err.stack,
                        userId,
                        mriUploadId,
                    });
                }
            }
        }
    } else {
        logger.info(`No MRI Scan ID provided. Skipping auto-prediction for test ${cognitiveTest._id}`);
    }

    return {
        cognitiveTest,
        prediction: predictionResult,
    };
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

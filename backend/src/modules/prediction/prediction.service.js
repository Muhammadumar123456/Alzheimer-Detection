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

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const MRI = require('../upload/mri.model');
const CognitiveTest = require('../cognitive/cognitive.model');
const resultsService = require('../results/results.service');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

// =========================================================================
// RETRY CONFIGURATION
// =========================================================================
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // 1 second, doubles each retry

// =========================================================================
// ML SERVICE HEALTH CHECK
// =========================================================================

/**
 * Check whether the ML microservice is healthy and models are loaded.
 * @returns {Promise<object>} Health status from the ML service
 */
exports.checkMLHealth = async () => {
    try {
        const response = await axios.get(`${config.ml.url}/health`, {
            timeout: 5000, // Health check should be fast
        });

        return {
            status: response.data.status,
            modelsLoaded: response.data.models_loaded,
            modelVersion: response.data.model_version,
            mlServiceUrl: config.ml.url,
        };
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            return {
                status: 'unavailable',
                modelsLoaded: false,
                modelVersion: null,
                mlServiceUrl: config.ml.url,
                error: 'ML service is not running.',
            };
        }

        return {
            status: 'error',
            modelsLoaded: false,
            modelVersion: null,
            mlServiceUrl: config.ml.url,
            error: err.message,
        };
    }
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
 * @returns {Promise<object>} Stored prediction result document
 */
exports.runPrediction = async ({ mriScanId, cognitiveTestId, userId }) => {
    // ------------------------------------------------------------------
    // 1. Fetch MRI record (including filePath for file read)
    // ------------------------------------------------------------------
    const mriRecord = await MRI.findById(mriScanId);

    if (!mriRecord) {
        throw new AppError('MRI scan not found.', 404);
    }

    // Verify ownership
    if (mriRecord.user.toString() !== userId) {
        throw new AppError('You are not authorized to use this MRI scan.', 403);
    }

    // Verify file exists on disk
    const mriFilePath = path.resolve(mriRecord.filePath);
    try {
        await fs.promises.access(mriFilePath, fs.constants.R_OK);
    } catch {
        logger.error(`MRI file not found on disk: ${mriFilePath}`);
        throw new AppError('MRI scan file not found on disk. It may have been deleted.', 404);
    }

    // ------------------------------------------------------------------
    // 2. Fetch cognitive test record
    // ------------------------------------------------------------------
    const cognitiveTest = await CognitiveTest.findById(cognitiveTestId);

    if (!cognitiveTest) {
        throw new AppError('Cognitive test not found.', 404);
    }

    // Verify ownership
    if (cognitiveTest.user.toString() !== userId) {
        throw new AppError('You are not authorized to use this cognitive test.', 403);
    }

    // Validate rawAnswers exist
    if (!cognitiveTest.rawAnswers || cognitiveTest.rawAnswers.length !== 30) {
        throw new AppError(
            'Cognitive test has no raw answers for ML prediction. Please retake the assessment.',
            400
        );
    }

    // ------------------------------------------------------------------
    // 3. Build multipart/form-data and call ML service
    // ------------------------------------------------------------------
    logger.info(`Sending prediction request to ML service`, {
        userId,
        mriScanId,
        cognitiveTestId,
        mlServiceUrl: config.ml.url,
    });

    let mlResponse;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Build fresh FormData and file stream for each attempt
            const formData = new FormData();
            const fileStream = fs.createReadStream(mriFilePath);
            const fileName = mriRecord.fileName || path.basename(mriFilePath);
            formData.append('mri_file', fileStream, {
                filename: fileName,
                contentType: 'image/jpeg',
            });
            formData.append('cognitive_answers', JSON.stringify(cognitiveTest.rawAnswers));

            mlResponse = await axios.post(`${config.ml.url}/predict`, formData, {
                headers: {
                    ...formData.getHeaders(),
                },
                timeout: config.ml.timeout,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            // Success — break out of retry loop
            if (attempt > 1) {
                logger.info(`ML prediction succeeded on attempt ${attempt}`);
            }
            break;
        } catch (err) {
            lastError = err;

            // Non-retryable errors: client-side issues (4xx from ML service)
            if (err.response && err.response.status >= 400 && err.response.status < 500) {
                const detail = err.response.data?.detail || err.response.statusText;
                logger.error('ML service rejected the request (non-retryable)', {
                    status: err.response.status,
                    detail,
                });
                throw new AppError(`ML service error: ${detail}`, err.response.status);
            }

            // Retryable errors: connection issues, timeouts, 5xx
            logger.warn(`ML prediction attempt ${attempt}/${MAX_RETRIES} failed`, {
                error: err.message,
                code: err.code,
            });

            if (attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                logger.info(`Retrying ML prediction in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    // All retries exhausted
    if (!mlResponse) {
        const err = lastError;
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            throw new AppError(
                'ML service is currently unavailable. Please try again later.',
                503
            );
        }
        if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
            throw new AppError('ML service timed out. Please try again.', 504);
        }
        if (err.response) {
            const detail = err.response.data?.detail || err.response.statusText;
            throw new AppError(
                `ML service error: ${detail}`,
                err.response.status >= 500 ? 502 : err.response.status
            );
        }
        throw new AppError('ML service returned an invalid response.', 502);
    }

    // ------------------------------------------------------------------
    // 4. Validate ML response
    // ------------------------------------------------------------------
    const mlData = mlResponse.data;

    if (
        !mlData ||
        !mlData.prediction ||
        typeof mlData.confidence !== 'number' ||
        !mlData.class_probabilities
    ) {
        logger.error('ML service returned malformed response', { mlData });
        throw new AppError('ML service returned an invalid response.', 502);
    }

    logger.info(`ML prediction received`, {
        prediction: mlData.prediction,
        confidence: mlData.confidence,
        processingTimeMs: mlData.processing_time_ms,
    });

    // ------------------------------------------------------------------
    // 5. Store result in MongoDB
    // ------------------------------------------------------------------
    const storedResult = await resultsService.storePrediction({
        userId,
        mriScanId,
        cognitiveTestId,
        prediction: mlData.prediction,
        confidence: mlData.confidence,
        classProbabilities: mlData.class_probabilities,
        processingTimeMs: mlData.processing_time_ms,
        modelVersion: '1.0.0',
        status: 'completed',
        details: {
            mlServiceUrl: config.ml.url,
            rawProbabilities: mlData.class_probabilities,
        },
    });

    logger.info(`Prediction result stored`, {
        resultId: storedResult._id,
        userId,
        prediction: mlData.prediction,
    });

    return storedResult;
};

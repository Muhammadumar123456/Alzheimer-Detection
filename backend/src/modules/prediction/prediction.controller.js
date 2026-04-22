/**
 * =============================================================================
 * PREDICTION CONTROLLER (ML Integration)
 * =============================================================================
 * Request handlers for ML prediction routes.
 * Bridges API requests to the Prediction Service.
 * =============================================================================
 */

const predictionService = require('./prediction.service');
const resultsService = require('../results/results.service');
const predictionQueue = require('../../queues/prediction.queue');
const redisConnection = require('../../config/redis');
const config = require('../../config');
const logger = require('../../config/logger');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Run ML prediction
 * POST /api/predict
 */
exports.predict = asyncHandler(async (req, res) => {
    const start = Date.now();
    const predictionData = {
        mriScanId: req.body.mriScanId,
        cognitiveTestId: req.body.cognitiveTestId,
        userId: req.user.id,
    };

    // ------------------------------------------------------------------
    // ASYNC FLOW (Feature Flag)
    // ------------------------------------------------------------------
    const isRedisHealthy = redisConnection.status === 'ready';

    if (config.useAsync) {
        // DEMO SAFETY: If Redis is down and SafeMode is on, skip async and try sync
        if (!isRedisHealthy && config.safeMode) {
            logger.warn('Redis unavailable in SAFE_MODE. Auto-falling back to synchronous processing.', {
                userId: req.user.id,
                mriScanId: req.body.mriScanId
            });
        } else {
            try {
                // 1. Pre-create a "pending" result record for tracking
                const pendingResult = await resultsService.initiateResult(predictionData);

                // 2. Add job to queue with the result ID
                const job = await predictionQueue.add('ml-prediction', {
                    ...predictionData,
                    resultId: pendingResult._id,
                });
                
                logger.info('Prediction job successfully queued', { 
                    action: 'JOB_QUEUED',
                    jobId: job.id, 
                    resultId: pendingResult._id,
                    userId: req.user.id,
                    latencyMs: Date.now() - start
                });

                return sendSuccess(res, 202, 'Prediction assessment is being processed by AI.', {
                    status: 'pending',
                    jobId: job.id,
                    resultId: pendingResult._id,
                });
            } catch (err) {
                logger.error('Failed to initialize async prediction. Falling back to sync.', {
                    action: 'ASYNC_FAILURE',
                    error: err.message,
                    userId: req.user.id
                });
                // Fall through to sync logic if any part of the async setup fails
            }
        }
    }

    // ------------------------------------------------------------------
    // SYNC FLOW (Legacy / Fallback)
    // ------------------------------------------------------------------
    logger.info('Starting synchronous ML prediction', { 
        action: 'SYNC_PREDICTION_STARTED',
        userId: req.user.id 
    });

    const result = await predictionService.runPrediction(predictionData);

    logger.info('Synchronous ML prediction completed', { 
        action: 'SYNC_PREDICTION_COMPLETED',
        resultId: result._id,
        userId: req.user.id,
        latencyMs: Date.now() - start
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


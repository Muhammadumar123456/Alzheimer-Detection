/**
 * =============================================================================
 * PREDICTION WORKER
 * =============================================================================
 * BullMQ Worker process for handling Alzheimer detection ML jobs.
 * This should be run as a separate process in production.
 * =============================================================================
 */

const { Worker } = require('bullmq');
const MRI = require('../modules/upload/mri.model');
const CognitiveTest = require('../modules/cognitive/cognitive.model');
const resultsService = require('../modules/results/results.service');
const mlClient = require('../utils/mlClient');
const config = require('../config');
const redisConnection = require('../config/redis');
const logger = require('../config/logger');

// Queue Name
const QUEUE_NAME = 'prediction-queue';

/**
 * Worker Logic
 * Handles fetching data, calling ML service, and persisting results.
 */
let worker = null;

if (config.useAsync) {
    worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            const start = Date.now();
            const { mriScanId, cognitiveTestId, userId, resultId } = job.data;

            logger.info('Worker started processing job', { 
                action: 'WORKER_JOB_STARTED',
                jobId: job.id, 
                resultId, 
                userId 
            });

            try {
                // 1. Progress: Started
                await job.updateProgress(10);
                await resultsService.updateResult(resultId, { status: 'pending' });

                // 2. Fetch required records
                const mriRecord = await MRI.findById(mriScanId);
                const cognitiveTest = await CognitiveTest.findById(cognitiveTestId);

                if (!mriRecord || !cognitiveTest) {
                    throw new Error('Required records (MRI or cognitive test) not found in database.');
                }

                await job.updateProgress(30);
                logger.info('Data fetched successfully', { 
                    action: 'WORKER_DATA_FETCHED',
                    jobId: job.id,
                    resultId 
                });

                // 3. Call ML Service
                logger.info('Calling ML service...', { 
                    action: 'WORKER_ML_CALL_INITIATED',
                    jobId: job.id 
                });
                
                const mlData = await mlClient.predict(mriRecord, cognitiveTest.rawAnswers);
                
                await job.updateProgress(80);
                logger.info('ML service response received', { 
                    action: 'WORKER_ML_RESPONSE_RECEIVED',
                    jobId: job.id,
                    prediction: mlData.prediction,
                    confidence: mlData.confidence
                });

                // 4. Update Result to COMPLETED
                const finalResult = await resultsService.updateResult(resultId, {
                    prediction: mlData.prediction,
                    confidence: mlData.confidence,
                    classProbabilities: mlData.class_probabilities,
                    processingTimeMs: mlData.processing_time_ms,
                    modelVersion: mlData.model_version || '1.0.0',
                    status: 'completed',
                    details: {
                        mlServiceUrl: config.ml.url,
                        processedAt: new Date(),
                        jobId: job.id,
                        latencyMs: Date.now() - start
                    }
                });

                await job.updateProgress(100);
                logger.info('Job completed successfully', { 
                    action: 'WORKER_JOB_COMPLETED',
                    jobId: job.id,
                    resultId: finalResult._id,
                    totalLatencyMs: Date.now() - start
                });

                return { success: true, resultId: finalResult._id };

            } catch (err) {
                // Log error with metadata for observability
                logger.error('Worker job iteration failed', {
                    action: 'WORKER_JOB_FAILED_ATTEMPT',
                    jobId: job.id,
                    attempt: job.attemptsMade + 1,
                    error: err.message,
                    resultId
                });
                throw err; // Re-throw for BullMQ retry logic
            }
        },
        {
            connection: redisConnection,
            concurrency: 1, 
        }
    );

    // =============================================================================
    // WORKER EVENT LISTENERS
    // =============================================================================

    worker.on('completed', (job) => {
        logger.info('Worker job lifecycle finished', { 
            action: 'WORKER_LIFECYCLE_COMPLETED',
            jobId: job.id 
        });
    });

    worker.on('failed', async (job, err) => {
        const { resultId } = job.data;
        const maxAttempts = job.opts.attempts || 1;
        const isLastAttempt = job.attemptsMade >= maxAttempts;

        if (isLastAttempt) {
            logger.error('Worker job CRITICALLY FAILED after max retries', {
                action: 'WORKER_MAX_RETRIES_EXHAUSTED',
                jobId: job.id,
                error: err.message,
                resultId
            });

            // Update DB to FAILED for visibility
            try {
                await resultsService.updateResult(resultId, {
                    status: 'failed',
                    errorMessage: err.message || 'Maximum retry attempts reached.'
                });
            } catch (dbErr) {
                logger.error('Failed to update DB to failed state', { action: 'DB_UPDATE_ERROR', resultId });
            }
        } else {
            logger.warn('Worker job failed, scheduled for retry', {
                action: 'WORKER_RETRY_SCHEDULED',
                jobId: job.id,
                attempt: job.attemptsMade,
                nextAttemptIn: 'exponential backoff'
            });
        }
    });

    worker.on('error', (err) => {
        logger.error('Unexpected Worker technical error', { 
            action: 'WORKER_TECHNICAL_ERROR',
            error: err.message 
        });
    });

    logger.info(`🚀 Prediction Worker active and observing '${QUEUE_NAME}'`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('Worker SIGTERM received, shutting down gracefully...');
        await worker.close();
    });
} else {
    logger.info('Prediction Worker disabled (USE_ASYNC=false).');
}


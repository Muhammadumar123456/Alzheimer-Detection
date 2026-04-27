/**
 * =============================================================================
 * PREDICTION WORKER (Standalone Process)
 * =============================================================================
 * Independent process for handling Alzheimer detection ML jobs.
 * This process connects to MongoDB and Redis independently.
 * 
 * Usage: node workers/prediction.worker.js
 * =============================================================================
 */

const path = require('path');
// Ensure environment variables are loaded from the root .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Worker } = require('bullmq');
const connectDB = require('../src/config/database');
const predictionService = require('../src/modules/prediction/prediction.service');
const redisConnection = require('../src/config/redis');
const logger = require('../src/config/logger');
const config = require('../src/config');

// Queue Name (standardized)
const QUEUE_NAME = 'prediction-queue';

/**
 * Main Worker Entry Point
 */
async function startWorker() {
    try {
        // 1. Connect to Database (Independent connection)
        await connectDB();
        logger.info('Worker database connection established');

        // 2. Initialize BullMQ Worker
        const worker = new Worker(
            QUEUE_NAME,
            async (job) => {
                const start = Date.now();
                const { mriScanId, cognitiveTestId, userId, resultId } = job.data;

                logger.info(`Worker processing job ${job.id}`, { 
                    action: 'WORKER_JOB_STARTED',
                    jobId: job.id, 
                    resultId, 
                    userId 
                });

                try {
                    // Update progress (visible in dashboard/monitoring)
                    await job.updateProgress(10);

                    // Re-use the robust prediction service logic
                    // This handles MRI fetching, ML call, and DB persistence
                    await predictionService.runPrediction({
                        mriScanId,
                        cognitiveTestId,
                        userId,
                        resultId // Triggers the update flow instead of create flow
                    });

                    await job.updateProgress(100);
                    logger.info(`Job ${job.id} completed successfully in ${Date.now() - start}ms`);

                    return { success: true };
                } catch (err) {
                    logger.error(`Worker job execution failed for job ${job.id}: ${err.message}`, {
                        action: 'WORKER_JOB_FAILED',
                        jobId: job.id,
                        error: err.message,
                        stack: err.stack
                    });
                    throw err; // BullMQ will handle retries based on queue config
                }
            },
            {
                connection: redisConnection,
                concurrency: 1, // Single job at a time per worker process
            }
        );

        // =============================================================================
        // EVENT LISTENERS
        // =============================================================================

        worker.on('completed', (job) => {
            logger.info(`Job ${job.id} lifecycle finished successfully`);
        });

        worker.on('failed', (job, err) => {
            logger.error(`Job ${job.id} failed after max retries: ${err.message}`);
        });

        worker.on('error', (err) => {
            logger.error('Unexpected Worker technical error:', err);
        });

        logger.info(`🚀 Prediction Worker active and observing '${QUEUE_NAME}'`);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('Worker SIGTERM received, shutting down gracefully...');
            await worker.close();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            logger.info('Worker SIGINT received, shutting down gracefully...');
            await worker.close();
            process.exit(0);
        });

    } catch (err) {
        logger.error('Failed to start worker process:', err);
        process.exit(1);
    }
}

// Start only if async is enabled in .env
if (config.useAsync) {
    startWorker();
} else {
    logger.warn('Prediction Worker started but USE_ASYNC=false. Exiting.');
    process.exit(0);
}

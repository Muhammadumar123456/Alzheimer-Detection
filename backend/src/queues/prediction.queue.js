/**
 * =============================================================================
 * PREDICTION QUEUE
 * =============================================================================
 * BullMQ Queue for Alzheimer detection jobs.
 * This file only initializes the queue, not the worker.
 * =============================================================================
 */

const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');
const config = require('../config');
const logger = require('../config/logger');

// Queue Name
const QUEUE_NAME = 'prediction-queue';

/**
 * Initialize the Queue with shared Redis connection
 */
let predictionQueue = null;

if (config.useAsync) {
    predictionQueue = new Queue(QUEUE_NAME, {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: config.queue.attempts,
            timeout: config.queue.jobTimeout, 
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: {
                age: 24 * 3600, // keep for 1 day
                count: 500,     // keep last 500
            },
            removeOnFail: {
                age: 7 * 24 * 3600, // keep for 7 days
                count: 1000,
            },
        },
    });

    // Event listeners for debugging (queue level)
    predictionQueue.on('error', (err) => {
        logger.error(`Queue '${QUEUE_NAME}' error:`, { 
            message: err.message,
            stack: err.stack 
        });
    });

    predictionQueue.on('waiting', (jobId) => {
        logger.info(`Job ${jobId} enters 'waiting' state.`);
    });
} else {
    // In sync mode, we still export null. 
    // The controller checks config.useAsync before calling predictionQueue.add()
    logger.info(`Prediction Queue initialization skipped (USE_ASYNC=false)`);
}

module.exports = predictionQueue;


/**
 * =============================================================================
 * HEALTH MONITORING CONTROLLER
 * =============================================================================
 * Specialized handlers for system health monitoring and diagnostics.
 * Used for production observability and demo safety verification.
 * =============================================================================
 */

const mongoose = require('mongoose');
const axios = require('axios');
const redisConnection = require('../../config/redis');
const config = require('../../config');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * General API Health Check
 * GET /api/health
 */
exports.getGeneralHealth = asyncHandler(async (req, res) => {
    const start = Date.now();
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'healthy' : 'unhealthy';
    
    const healthData = {
        status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
        latencyMs: Date.now() - start,
        services: {
            database: dbStatus,
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
        }
    };

    const statusCode = dbStatus === 'healthy' ? 200 : 503;
    sendSuccess(res, statusCode, `System is ${healthData.status}`, healthData);
});

/**
 * Redis & Queue Health Check
 * GET /api/health/redis
 */
exports.getRedisHealth = asyncHandler(async (req, res) => {
    const start = Date.now();
    let status = 'unhealthy';
    let details = {};

    // 1. Check if Redis is intentionally disabled
    if (!config.useAsync || redisConnection.status === 'disabled') {
        return sendSuccess(res, 200, 'Redis/Async processing is disabled (SYNC Mode active)', {
            status: 'disabled',
            mode: 'sync',
            latencyMs: Date.now() - start,
            connected: false
        });
    }

    // 2. Attempt Ping if enabled
    try {
        const ping = await redisConnection.ping();
        if (ping === 'PONG') {
            status = 'healthy';
            details = {
                connected: true,
                mode: 'async',
                safeMode: config.safeMode
            };
        }
    } catch (err) {
        details = { error: err.message, connected: false };
    }

    sendSuccess(res, status === 'healthy' ? 200 : 503, `Redis is ${status}`, {
        status,
        latencyMs: Date.now() - start,
        ...details
    });
});

/**
 * ML Microservice Health Check
 * GET /api/health/ml-service
 */
exports.getMLHealth = asyncHandler(async (req, res) => {
    const start = Date.now();
    let status = 'unhealthy';
    let details = {};

    try {
        const mlRes = await axios.get(`${config.ml.url}/health`, { timeout: 3000 });
        status = mlRes.data.status === 'healthy' ? 'healthy' : 'degraded';
        details = {
            modelsLoaded: mlRes.data.models_loaded,
            modelVersion: mlRes.data.model_version,
            mlUrl: config.ml.url
        };
    } catch (err) {
        details = { error: err.message, mlUrl: config.ml.url };
    }

    sendSuccess(res, status === 'healthy' ? 200 : 503, `ML Service is ${status}`, {
        status,
        latencyMs: Date.now() - start,
        ...details
    });
});

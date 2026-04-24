/**
 * =============================================================================
 * ML CLIENT UTILITY
 * =============================================================================
 * Specialized client for communicating with the Python FastAPI ML Service.
 * Handles FormData construction, request retries, and error mapping.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');
const logger = require('../config/logger');
const AppError = require('./AppError');

// Retry Configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Perform health check on ML Service
 */
exports.checkHealth = async () => {
    try {
        const response = await axios.get(`${config.ml.url}/health`, {
            timeout: 5000,
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
                mlServiceUrl: config.ml.url,
                error: 'ML service is not running.',
            };
        }
        return {
            status: 'error',
            mlServiceUrl: config.ml.url,
            error: err.message,
        };
    }
};

/**
 * Send multimodal data for Alzheimer prediction.
 * 
 * Supports dual storage modes:
 *   - LOCAL:      reads MRI from disk via fs.createReadStream
 *   - CLOUDINARY: fetches MRI from remote URL via axios stream
 * 
 * @param {object} mriRecord - MRI document from DB
 * @param {Array} cognitiveAnswers - Array of 30 binary answers
 * @returns {Promise<object>} Prediction results from ML service
 */
exports.predict = async (mriRecord, cognitiveAnswers) => {
    const isCloudFile = mriRecord.storageType === 'cloudinary';
    const fileName = mriRecord.fileName || 'mri_scan.jpg';

    // ------------------------------------------------------------------
    // Resolve file source based on storage type
    // ------------------------------------------------------------------
    let getFileStream;

    if (isCloudFile) {
        // CLOUD MODE: filePath contains the full Cloudinary URL
        const cloudUrl = mriRecord.filePath;
        logger.info(`ML Client: fetching MRI from cloud URL for prediction`);

        // Pre-validate that the URL is reachable
        try {
            await axios.head(cloudUrl, { timeout: 5000 });
        } catch {
            throw new AppError('MRI scan file not accessible from cloud storage.', 404);
        }

        // Factory: returns a fresh stream for each retry attempt
        getFileStream = async () => {
            const response = await axios.get(cloudUrl, {
                responseType: 'stream',
                timeout: config.ml.timeout,
            });
            return response.data;
        };
    } else {
        // LOCAL MODE: filePath is a relative disk path (existing behavior)
        const mriFilePath = path.resolve(mriRecord.filePath);

        // Safety check for file
        try {
            await fs.promises.access(mriFilePath, fs.constants.R_OK);
        } catch {
            throw new AppError('MRI scan file not found on disk.', 404);
        }

        // Factory: returns a fresh stream for each retry attempt
        getFileStream = async () => fs.createReadStream(mriFilePath);
    }

    // ------------------------------------------------------------------
    // Retry loop (shared between both storage modes)
    // ------------------------------------------------------------------
    let mlResponse;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const formData = new FormData();
            const fileStream = await getFileStream();

            formData.append('mri_file', fileStream, {
                filename: fileName,
                contentType: 'image/jpeg',
            });
            formData.append('cognitive_answers', JSON.stringify(cognitiveAnswers));

            mlResponse = await axios.post(`${config.ml.url}/predict`, formData, {
                headers: { ...formData.getHeaders() },
                timeout: config.ml.timeout,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            break; // Success
        } catch (err) {
            lastError = err;

            // Non-retryable: 4xx errors
            if (err.response && err.response.status >= 400 && err.response.status < 500) {
                const detail = err.response.data?.detail || err.response.statusText;
                throw new AppError(`ML service rejected request: ${detail}`, err.response.status);
            }

            // Retryable: connection issues, timeouts, or 5xx
            if (attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
                logger.warn(`ML attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }

    if (!mlResponse) {
        throw exports._mapError(lastError);
    }

    return mlResponse.data;
};

/**
 * Map axios/network errors to AppError
 * @private
 */
exports._mapError = (err) => {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return new AppError('ML service is currently unavailable.', 503);
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return new AppError('ML service timed out.', 504);
    }
    if (err.response) {
        const detail = err.response.data?.detail || err.response.statusText;
        return new AppError(`ML service error: ${detail}`, err.response.status >= 500 ? 502 : err.response.status);
    }
    return new AppError('ML service returned an invalid response.', 502);
};

/**
 * =============================================================================
 * UPLOAD SERVICE (MRI File Management — Dual Storage)
 * =============================================================================
 * Business logic for MRI file upload, listing, retrieval, and deletion.
 * Handles metadata persistence and physical file management.
 *
 * Supports dual storage modes:
 *   - local:      files on disk (existing behavior)
 *   - cloudinary:  files in Cloudinary CDN (placeholder — not yet wired)
 * =============================================================================
 */

const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;
const MRI = require('./mri.model');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

// =========================================================================
// CLOUDINARY CONFIGURATION
// =========================================================================

cloudinary.config({
    cloud_name: config.storage.cloudinary.cloudName,
    api_key: config.storage.cloudinary.apiKey,
    api_secret: config.storage.cloudinary.apiSecret,
});

// =========================================================================
// CLOUD STORAGE OPERATIONS
// =========================================================================

/**
 * Upload a file buffer to Cloudinary using a promise-wrapped upload_stream.
 *
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} fileName - Original file name for reference
 * @returns {Promise<{ url: string, publicId: string }>} Cloud file metadata
 */
exports.uploadToCloud = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: config.storage.cloudinary.folder,
                resource_type: 'auto',
                public_id: `${Date.now()}-${path.parse(fileName).name}`,
            },
            (error, result) => {
                if (error) {
                    logger.error(`Cloudinary upload failed: ${error.message}`);
                    return reject(new AppError('Failed to upload MRI to cloud storage.', 500));
                }
                logger.info(`Cloudinary upload successful: ${result.secure_url}`);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        // Pipe buffer to the upload stream
        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

/**
 * Delete a file from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public ID
 * @returns {Promise<void>}
 */
const deleteFromCloud = async (publicId) => {
    if (!publicId) return;

    try {
        logger.info(`Initiating Cloudinary asset deletion: ${publicId}`);
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok') {
            logger.info(`Cloudinary asset deleted: ${publicId}`);
        } else {
            logger.warn(`Cloudinary deletion returned status: ${result.result} for ID: ${publicId}`);
        }
    } catch (err) {
        // Log but don't fail the request
        logger.warn(`Cloudinary deletion error for ID: ${publicId} — ${err.message}`);
    }
};

/**
 * Save MRI upload metadata to the database
 * @param {object} data - { userId, fileName, filePath, fileSize, mimeType, storageType, cloudinaryPublicId }
 * @returns {Promise<object>} Created MRI document
 */
exports.saveMRIRecord = async ({ 
    userId, 
    fileName, 
    filePath, 
    fileSize, 
    mimeType, 
    storageType = 'local',
    cloudinaryPublicId = null
}) => {
    // ------------------------------------------------------------------
    // PRODUCTION HARDENING: Store relative paths for local storage,
    // or full URLs for cloud storage.
    // ------------------------------------------------------------------
    let standardizedPath = filePath;
    
    if (storageType === 'local' && path.isAbsolute(filePath)) {
        // Calculate path relative to the backend root directory
        // Current __dirname: backend/src/modules/upload
        // Target backend root: .. (modules) / .. (src) / .. (backend root)
        const backendRoot = path.join(__dirname, '..', '..', '..');
        standardizedPath = path.relative(backendRoot, filePath);
    }

    const mriRecord = await MRI.create({
        user: userId,
        fileName,
        filePath: standardizedPath,
        fileSize,
        mimeType,
        storageType,
        cloudinaryPublicId,
    });

    logger.info(`MRI metadata saved: ${fileName} (${(fileSize / 1024).toFixed(2)} KB) [Storage: ${storageType}]`);

    return mriRecord;
};

/**
 * Get paginated list of MRI uploads for a user
 * @param {string} userId - Mongoose User ID
 * @param {object} paginationParams - { page, limit, skip, sort }
 * @returns {Promise<{ docs: Array, pagination: object }>} Paginated results
 */
exports.getMRIsByUser = async (userId, paginationParams) => {
    const result = await paginateQuery(
        MRI,
        { user: userId },
        paginationParams
    );

    return result;
};

/**
 * Get a single MRI record by ID
 * @param {string} mriId - MRI document ID
 * @returns {Promise<object>} MRI document
 */
exports.getMRIById = async (mriId) => {
    const mri = await MRI.findById(mriId);

    if (!mri) {
        throw new AppError('MRI record not found', 404);
    }

    return mri;
};

/**
 * Delete an MRI record and its physical file
 * @param {string} mriId - MRI document ID
 * @param {string} userId - Requesting user's ID (for ownership verification)
 * @returns {Promise<object>} Deleted MRI document
 */
exports.deleteMRI = async (mriId, userId) => {
    const mri = await MRI.findById(mriId);

    if (!mri) {
        throw new AppError('MRI record not found', 404);
    }

    // Verify ownership
    if (mri.user.toString() !== userId) {
        throw new AppError('You are not authorized to delete this file', 403);
    }

    // Delete file (disk or cloud based on storage type)
    if (mri.storageType === 'cloudinary') {
        await deleteFromCloud(mri.cloudinaryPublicId);
    } else {
        // Local mode: delete physical file from disk
        try {
            const absolutePath = path.resolve(__dirname, '..', '..', '..', mri.filePath);
            await fs.unlink(absolutePath);
            logger.info(`Physical MRI file deleted: ${mri.filePath}`);
        } catch (err) {
            // File may already be missing — log but don't fail
            logger.warn(`Could not delete physical file: ${mri.filePath} — ${err.message}`);
        }
    }

    // Delete database record
    await MRI.findByIdAndDelete(mriId);

    logger.info(`MRI record deleted: ${mri.fileName} by user ${userId}`);

    return mri;
};

/**
 * Delete all MRI records and files for a user (cascade delete)
 * @param {string} userId - Mongoose User ID
 * @returns {Promise<number>} Number of deleted records
 */
exports.deleteAllMRIsByUser = async (userId) => {
    const mris = await MRI.find({ user: userId });

    // Delete files (disk or cloud based on each record's storage type)
    for (const mri of mris) {
        if (mri.storageType === 'cloudinary') {
            await deleteFromCloud(mri.cloudinaryPublicId);
        } else {
            try {
                const absolutePath = path.resolve(__dirname, '..', '..', '..', mri.filePath);
                await fs.unlink(absolutePath);
            } catch (err) {
                logger.warn(`Could not delete physical file: ${mri.filePath} — ${err.message}`);
            }
        }
    }

    // Delete all records
    const result = await MRI.deleteMany({ user: userId });

    logger.info(`Cascade deleted ${result.deletedCount} MRI records for user ${userId}`);

    return result.deletedCount;
};

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
const MRI = require('./mri.model');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

// =========================================================================
// CLOUD STORAGE PLACEHOLDERS (to be implemented in future Cloudinary task)
// =========================================================================

/**
 * Placeholder: Upload a file buffer to Cloudinary.
 * Will be replaced with actual cloudinary.v2.uploader.upload_stream() call.
 *
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} fileName - Original file name for reference
 * @returns {Promise<{ url: string, publicId: string }>} Cloud file metadata
 */
exports.uploadToCloud = async (fileBuffer, fileName) => {
    // TODO: Implement Cloudinary upload in future task
    logger.warn(`Cloud upload called but not yet implemented. File: ${fileName}`);
    throw new AppError('Cloud storage (Cloudinary) is not yet configured. Set STORAGE_TYPE=local.', 501);
};

/**
 * Placeholder: Delete a file from Cloudinary by its URL/public ID.
 * Will be replaced with actual cloudinary.v2.uploader.destroy() call.
 *
 * @param {string} filePath - The Cloudinary URL or public ID
 * @returns {Promise<void>}
 */
const deleteFromCloud = async (filePath) => {
    // TODO: Implement Cloudinary deletion in future task
    logger.warn(`Cloud delete not yet implemented. Skipping deletion of: ${filePath}`);
};

/**
 * Save MRI upload metadata to the database
 * @param {object} data - { userId, fileName, filePath, fileSize, mimeType, storageType }
 * @returns {Promise<object>} Created MRI document
 */
exports.saveMRIRecord = async ({ userId, fileName, filePath, fileSize, mimeType, storageType = 'local' }) => {
    // ------------------------------------------------------------------
    // PRODUCTION HARDENING: Store relative paths for local storage,
    // or full URLs for cloud storage.
    // ------------------------------------------------------------------
    let standardizedPath = filePath;
    
    if (storageType === 'local' && path.isAbsolute(filePath)) {
        // Calculate path relative to the backend root directory
        const backendRoot = path.join(__dirname, '..', '..');
        standardizedPath = path.relative(backendRoot, filePath);
    }

    const mriRecord = await MRI.create({
        user: userId,
        fileName,
        filePath: standardizedPath,
        fileSize,
        mimeType,
        storageType,
    });

    logger.info(`MRI metadata saved: ${fileName} (${(fileSize / 1024).toFixed(2)} KB)`);

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
        await deleteFromCloud(mri.filePath);
    } else {
        // Local mode: delete physical file from disk
        try {
            const absolutePath = path.resolve(__dirname, '..', '..', mri.filePath);
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
            await deleteFromCloud(mri.filePath);
        } else {
            try {
                const absolutePath = path.resolve(__dirname, '..', '..', mri.filePath);
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

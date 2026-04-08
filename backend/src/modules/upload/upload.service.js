/**
 * =============================================================================
 * UPLOAD SERVICE (MRI File Management)
 * =============================================================================
 * Business logic for MRI file upload, listing, retrieval, and deletion.
 * Handles metadata persistence and physical file management.
 * =============================================================================
 */

const fs = require('fs').promises;
const MRI = require('./mri.model');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

/**
 * Save MRI upload metadata to the database
 * @param {object} data - { userId, fileName, filePath }
 * @returns {Promise<object>} Created MRI document
 */
exports.saveMRIRecord = async ({ userId, fileName, filePath }) => {
    const mriRecord = await MRI.create({
        user: userId,
        fileName,
        filePath,
    });

    logger.info(`MRI file uploaded: ${fileName} by user ${userId}`);

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
        paginationParams,
        {
            select: '-filePath', // Never expose filesystem paths
        }
    );

    return result;
};

/**
 * Get a single MRI record by ID
 * @param {string} mriId - MRI document ID
 * @returns {Promise<object>} MRI document (without filePath)
 */
exports.getMRIById = async (mriId) => {
    const mri = await MRI.findById(mriId).select('-filePath');

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

    // Delete physical file from disk
    try {
        await fs.unlink(mri.filePath);
        logger.info(`Physical MRI file deleted: ${mri.filePath}`);
    } catch (err) {
        // File may already be missing — log but don't fail
        logger.warn(`Could not delete physical file: ${mri.filePath} — ${err.message}`);
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

    // Delete physical files
    for (const mri of mris) {
        try {
            await fs.unlink(mri.filePath);
        } catch (err) {
            logger.warn(`Could not delete physical file: ${mri.filePath} — ${err.message}`);
        }
    }

    // Delete all records
    const result = await MRI.deleteMany({ user: userId });

    logger.info(`Cascade deleted ${result.deletedCount} MRI records for user ${userId}`);

    return result.deletedCount;
};

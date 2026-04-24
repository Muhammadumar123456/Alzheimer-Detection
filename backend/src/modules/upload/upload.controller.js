/**
 * =============================================================================
 * UPLOAD CONTROLLER (MRI File Management)
 * =============================================================================
 * Request handlers for MRI file upload, listing, retrieval, and deletion.
 * Supports both single and multiple file uploads (1–4 files).
 * =============================================================================
 */

const uploadService = require('./upload.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../../utils/responseHelper');
const { uploadMRI: uploadMRIChain, IS_CLOUD_STORAGE } = require('../../middleware/upload');
const AppError = require('../../utils/AppError');
const { parsePaginationParams } = require('../../utils/paginate');

/**
 * Upload MRI file(s) — supports 1 to 4 files
 * POST /api/upload/mri
 */
exports.uploadMRI = asyncHandler(async (req, res) => {
    // Support both req.files (array) and req.file (single) for backwards compat
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
        throw new AppError('No MRI file(s) provided. Please upload at least one file.', 400);
    }

    // Save each file as a separate MRI record
    const savedFiles = [];
    for (const file of files) {
        let mriRecord;

        if (IS_CLOUD_STORAGE) {
            // CLOUD MODE: file.buffer exists instead of file.path
            const cloudData = await uploadService.uploadToCloud(file.buffer, file.originalname);
            
            mriRecord = await uploadService.saveMRIRecord({
                userId: req.user.id,
                fileName: file.originalname,
                filePath: cloudData.url, // Full Cloudinary URL
                fileSize: file.size,
                mimeType: file.mimetype,
                storageType: 'cloudinary',
                cloudinaryPublicId: cloudData.publicId,
            });
        } else {
            // LOCAL MODE: file.path exists (existing behavior)
            mriRecord = await uploadService.saveMRIRecord({
                userId: req.user.id,
                fileName: file.filename,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                storageType: 'local',
            });
        }

        savedFiles.push({
            id: mriRecord._id,
            fileName: mriRecord.fileName,
            fileUrl: mriRecord.fileUrl,
            uploadedAt: mriRecord.uploadedAt,
        });
    }

    sendSuccess(res, 201, `${savedFiles.length} MRI file(s) uploaded successfully`, {
        files: savedFiles,
        count: savedFiles.length,
    });
});

/**
 * List own MRI uploads — paginated
 * GET /api/upload/my
 */
exports.getMyMRIs = asyncHandler(async (req, res) => {
    const paginationParams = parsePaginationParams(req.query, { sort: { uploadedAt: -1 } });
    const result = await uploadService.getMRIsByUser(req.user.id, paginationParams);

    sendPaginated(res, 200, 'MRI files retrieved successfully', result, 'files');
});

/**
 * Get a single MRI record by ID
 * GET /api/upload/:id
 */
exports.getMRI = asyncHandler(async (req, res) => {
    const mri = await uploadService.getMRIById(req.params.id);

    sendSuccess(res, 200, 'MRI file retrieved successfully', { file: mri });
});

/**
 * Delete own MRI upload
 * DELETE /api/upload/:id
 */
exports.deleteMRI = asyncHandler(async (req, res) => {
    await uploadService.deleteMRI(req.params.id, req.user.id);

    sendSuccess(res, 200, 'MRI file deleted successfully');
});

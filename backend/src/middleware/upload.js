/**
 * =============================================================================
 * FILE UPLOAD MIDDLEWARE (Multer)
 * =============================================================================
 * Configures multer for MRI file uploads.
 * - Storage: uploads/mri/
 * - Allowed types: .nii, .nii.gz, .jpg, .png
 * - Max file size: 50MB
 * - Auto-creates upload directory if missing
 * =============================================================================
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

// =========================================================================
// CONFIGURATION
// =========================================================================

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'mri');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_EXTENSIONS = ['.nii', '.gz', '.jpg', '.png'];
const ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'application/gzip',
    'application/octet-stream', // .nii files don't have a standard MIME type
];

// =========================================================================
// AUTO-CREATE UPLOAD DIRECTORY
// =========================================================================

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =========================================================================
// FILENAME SANITIZATION
// =========================================================================

/**
 * Sanitize a filename by removing path traversal sequences,
 * null bytes, control characters, and collapsing whitespace.
 * @param {string} filename - Original filename from the client
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
    return filename
        .replace(/\.\.\//g, '')          // Remove ../
        .replace(/\.\.\\/g, '')          // Remove ..\
        .replace(/^[/\\]+/, '')          // Remove leading slashes
        .replace(/\0/g, '')             // Remove null bytes
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Remove control characters
        .replace(/\s+/g, '_')           // Collapse whitespace to underscore
        .replace(/[<>:"|?*]/g, '_');    // Remove filesystem-unsafe characters
};

// =========================================================================
// STORAGE CONFIGURATION
// =========================================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Format: userId-timestamp-originalname
        const userId = req.user ? req.user.id : 'unknown';
        const timestamp = Date.now();
        const safeName = sanitizeFilename(file.originalname);
        const generatedName = `${userId}-${timestamp}-${safeName}`;

        logger.info('File upload accepted', {
            userId,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size || 'unknown',
            savedAs: generatedName,
        });

        cb(null, generatedName);
    },
});

// =========================================================================
// FILE FILTER
// =========================================================================

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = file.originalname.toLowerCase();

    // Check for .nii.gz (compound extension)
    const isNiiGz = originalName.endsWith('.nii.gz');
    const isAllowedExt =
        isNiiGz || (ALLOWED_EXTENSIONS.includes(ext) && ext !== '.gz');

    if (!isAllowedExt) {
        logger.warn('File upload rejected: invalid extension', {
            userId: req.user ? req.user.id : 'unknown',
            originalName: file.originalname,
            extension: ext,
        });
        return cb(
            new AppError(
                `File type not allowed. Accepted types: .nii, .nii.gz, .jpg, .png`,
                400
            ),
            false
        );
    }

    // Validate MIME type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        logger.warn('File upload rejected: invalid MIME type', {
            userId: req.user ? req.user.id : 'unknown',
            originalName: file.originalname,
            mimeType: file.mimetype,
        });
        return cb(
            new AppError(
                `File MIME type '${file.mimetype}' is not allowed. Accepted types: ${ALLOWED_MIMETYPES.join(', ')}`,
                400
            ),
            false
        );
    }

    cb(null, true);
};

// =========================================================================
// MULTER INSTANCE
// =========================================================================

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

/**
 * Middleware for MRI file upload.
 * Accepts up to 4 files. Field name: 'mriFiles'
 * Backwards compatible — works with 1 to 4 files.
 */
const uploadMRI = upload.array('mriFiles', 4);

module.exports = { uploadMRI, UPLOAD_DIR };

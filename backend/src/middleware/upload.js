/**
 * =============================================================================
 * FILE UPLOAD MIDDLEWARE (Multer)
 * =============================================================================
 * Configures multer for MRI file uploads.
 * - Storage: uploads/mri/
 * - Allowed types: .jpg, .jpeg, .png (strict image-only)
 * - Max file size: 50MB
 * - Auto-creates upload directory if missing
 * - Post-upload magic-byte verification to reject renamed non-images
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

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png'];

/**
 * Magic byte signatures for validating actual file content.
 * These are the first bytes of a valid JPEG or PNG file.
 */
const MAGIC_BYTES = {
    jpeg: [
        Buffer.from([0xff, 0xd8, 0xff]),       // Standard JPEG/JFIF/EXIF
    ],
    png: [
        Buffer.from([0x89, 0x50, 0x4e, 0x47]), // PNG signature
    ],
};

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
        .replace(/\.\.\\/g, '')          // Remove ..\\
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

        logger.info('File upload accepted (pre-validation)', {
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
// FILE FILTER — extension + MIME type validation
// =========================================================================

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // 1. Validate file extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        logger.warn('File upload rejected: invalid extension', {
            userId: req.user ? req.user.id : 'unknown',
            originalName: file.originalname,
            extension: ext,
        });
        return cb(
            new AppError(
                'Invalid file type. Only MRI images (JPG, PNG) are allowed.',
                400
            ),
            false
        );
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        logger.warn('File upload rejected: invalid MIME type', {
            userId: req.user ? req.user.id : 'unknown',
            originalName: file.originalname,
            mimeType: file.mimetype,
        });
        return cb(
            new AppError(
                'Invalid file type. Only MRI images (JPG, PNG) are allowed.',
                400
            ),
            false
        );
    }

    cb(null, true);
};

// =========================================================================
// MAGIC BYTE VALIDATION
// =========================================================================

/**
 * Check whether a file's first bytes match a known image signature.
 * @param {string} filePath - Absolute path to the uploaded file
 * @returns {Promise<boolean>} True if the file has valid JPEG or PNG magic bytes
 */
const validateMagicBytes = async (filePath) => {
    const HEADER_SIZE = 8; // Enough for both JPEG (3) and PNG (4) signatures
    const fd = await fs.promises.open(filePath, 'r');
    try {
        const buffer = Buffer.alloc(HEADER_SIZE);
        await fd.read(buffer, 0, HEADER_SIZE, 0);

        // Check JPEG signatures
        for (const sig of MAGIC_BYTES.jpeg) {
            if (buffer.subarray(0, sig.length).equals(sig)) return true;
        }

        // Check PNG signatures
        for (const sig of MAGIC_BYTES.png) {
            if (buffer.subarray(0, sig.length).equals(sig)) return true;
        }

        return false;
    } finally {
        await fd.close();
    }
};

/**
 * Post-upload middleware that reads the saved file's magic bytes to verify
 * it is actually a JPEG or PNG image. Deletes the file if validation fails.
 * This catches cases where a non-image file is renamed with a .jpg/.png extension.
 */
const validateUploadedFiles = async (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) return next();

    for (const file of files) {
        try {
            const isValid = await validateMagicBytes(file.path);

            if (!isValid) {
                // Delete the invalid file from disk
                try {
                    await fs.promises.unlink(file.path);
                } catch (unlinkErr) {
                    logger.warn(`Failed to delete invalid upload: ${file.path}`, {
                        error: unlinkErr.message,
                    });
                }

                logger.warn('File upload rejected: invalid magic bytes (not a real image)', {
                    userId: req.user ? req.user.id : 'unknown',
                    originalName: file.originalname,
                    savedAs: file.filename,
                });

                // Delete ALL files from this batch (atomic rejection)
                for (const f of files) {
                    if (f.path !== file.path) {
                        try {
                            await fs.promises.unlink(f.path);
                        } catch (_) { /* already deleted or missing */ }
                    }
                }

                return next(
                    new AppError(
                        `Invalid file type. "${file.originalname}" is not a valid image. Only MRI images (JPG, PNG) are allowed.`,
                        400
                    )
                );
            }
        } catch (err) {
            logger.error(`Magic byte validation error for ${file.path}`, {
                error: err.message,
            });
            return next(
                new AppError('File validation failed. Please try again.', 500)
            );
        }
    }

    logger.info(`Magic byte validation passed for ${files.length} file(s)`);
    next();
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
 * Middleware chain for MRI file upload:
 *   1. Multer — extension + MIME validation, save to disk
 *   2. validateUploadedFiles — magic byte verification
 *
 * Accepts up to 4 files. Field name: 'mriFiles'
 */
const uploadMRI = [upload.array('mriFiles', 4), validateUploadedFiles];

module.exports = { uploadMRI, UPLOAD_DIR };


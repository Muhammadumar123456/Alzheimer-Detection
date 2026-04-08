/**
 * =============================================================================
 * UPLOAD ROUTES (MRI File Management)
 * =============================================================================
 * Route definitions for MRI file operations.
 * All routes are protected — require a valid JWT via protect middleware.
 * =============================================================================
 */

const express = require('express');
const uploadController = require('./upload.controller');
const protect = require('../../middleware/protect');
const { uploadMRI } = require('../../middleware/upload');

const router = express.Router();

// All upload routes require authentication
router.use(protect);

/**
 * POST   /api/upload/mri  — Upload an MRI scan file (multer middleware)
 * GET    /api/upload/my   — List own MRI uploads (paginated)
 * GET    /api/upload/:id  — Get a specific MRI record
 * DELETE /api/upload/:id  — Delete own MRI upload + file from disk
 */
router.post('/mri', uploadMRI, uploadController.uploadMRI);
router.get('/my', uploadController.getMyMRIs);
router.get('/:id', uploadController.getMRI);
router.delete('/:id', uploadController.deleteMRI);

module.exports = router;

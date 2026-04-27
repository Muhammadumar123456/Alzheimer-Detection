/**
 * =============================================================================
 * USER ROUTES
 * =============================================================================
 * Route definitions for user profile management.
 * All routes are protected — require a valid JWT via protect middleware.
 * =============================================================================
 */

const express = require('express');
const userController = require('./user.controller');
const protect = require('../../middleware/protect');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();

// All user routes require authentication
router.use(protect);

/**
 * User Profile Routes
 */
router.get('/profile', userController.getProfile);
router.put('/profile', validate(schemas.updateProfile), userController.updateProfile);
router.delete('/profile', userController.deleteAccount);

module.exports = router;

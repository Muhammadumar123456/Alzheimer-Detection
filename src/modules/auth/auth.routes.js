/**
 * =============================================================================
 * AUTH ROUTES
 * =============================================================================
 * Route definitions for authentication.
 * =============================================================================
 */

const express = require('express');
const authController = require('./auth.controller');

const router = express.Router();

/**
 * Public Routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * Protected Routes
 * Note: protect middleware will be added in Task 4
 */
router.get('/me', authController.me);

module.exports = router;

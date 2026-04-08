/**
 * =============================================================================
 * AUTH ROUTES
 * =============================================================================
 * Route definitions for authentication.
 * - Public routes (register, login, forgot/reset password) are rate-limited.
 * - Protected routes (me, change-password) require a valid JWT.
 * - Google OAuth routes for social login.
 * =============================================================================
 */

const express = require('express');
const passport = require('passport');
const authController = require('./auth.controller');
const authService = require('./auth.service');
const protect = require('../../middleware/protect');
const { authLimiter } = require('../../middleware/rateLimiter');
const { validate, schemas } = require('../../middleware/validate');
const { sendSuccess } = require('../../utils/responseHelper');
const config = require('../../config');

const router = express.Router();

/**
 * Public Routes (rate-limited + validated)
 */
router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

/**
 * Protected Routes (JWT required)
 */
router.get('/me', protect, authController.me);
router.put('/change-password', protect, authLimiter, validate(schemas.changePassword), authController.changePassword);

/**
 * Google OAuth Routes
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const { user, token } = await authService.findOrCreateGoogleUser(req.user);
            // Redirect to frontend with token
            const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        } catch (err) {
            const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
        }
    }
);

module.exports = router;

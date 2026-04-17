/**
 * =============================================================================
 * AUTH SERVICE
 * =============================================================================
 * Business logic for user registration and authentication.
 * Handles JWT generation and password verification.
 * =============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('./user.model');
const config = require('../../config');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

/**
 * Generate a JWT token for a user
 * @param {string} userId - Mongoose User ID
 * @param {string} role - User role (patient/clinician/admin)
 * @returns {string} JWT Token
 */
const signToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * Register a new user
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} - { user, token }
 */
exports.registerUser = async (userData) => {
    const { name, email, password } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use. Please try another one.', 409);
    }

    // 2. Create new user
    // Password hashing is handled by the pre-save hook in user.model.js
    const newUser = await User.create({
        name,
        email,
        passwordHash: password,
    });

    // 3. Generate token
    const token = signToken(newUser._id, newUser.role);

    // 4. Log registration event
    logger.info('User registered successfully', {
        userId: newUser._id,
        role: newUser.role,
    });

    // 5. Prepare response (passwordHash is select:false, so it's already excluded)
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    return {
        user: userResponse,
        token,
    };
};

/**
 * Login an existing user
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { user, token }
 */
exports.loginUser = async (credentials) => {
    const { email, password } = credentials;

    // 1. Verify existence and compare password
    // We explicitly select +passwordHash because it's hidden by default
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
        logger.warn('Login failed: invalid credentials');
        throw new AppError('Invalid email or password', 401);
    }

    // 2. Generate token
    const token = signToken(user._id, user.role);

    // 3. Log login event
    logger.info('User logged in successfully', {
        userId: user._id,
        role: user.role,
    });

    // 4. Prepare response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return {
        user: userResponse,
        token,
    };
};

/**
 * Get user by ID (helper)
 * @param {string} id - User ID
 * @returns {Promise<User>}
 */
exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User no longer exists', 404);
    }
    return user;
};

/**
 * Change user's password
 * @param {string} userId - Mongoose User ID
 * @param {string} currentPassword - Current password for verification
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
exports.changePassword = async (userId, currentPassword, newPassword) => {
    // 1. Find user with password hash
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // 2. Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
    }

    // 3. Set new password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    await user.save();
};

/**
 * Forgot password — generate 6-digit OTP and send email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
exports.forgotPassword = async (email) => {
    const { sendPasswordResetEmail } = require('../../utils/emailService');

    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal if user exists or not
        return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (10 minutes)
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
        await sendPasswordResetEmail(email, otp);
        logger.info(`Password reset OTP sent to ${email}`);
    } catch (err) {
        // If email fails, clear the OTP
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });
        logger.error(`Failed to send reset email: ${err.message}`);
        throw new AppError('Failed to send reset email. Please try again later.', 500);
    }
};

/**
 * Reset password using OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP from email
 * @param {string} newPassword - New password
 * @returns {Promise<object>} - { user, token }
 */
exports.resetPassword = async (email, otp, newPassword) => {
    // 1. Find user with valid OTP and email
    const user = await User.findOne({
        email,
        passwordResetOTP: otp,
        passwordResetOTPExpires: { $gt: Date.now() },
    }).select('+passwordHash +passwordResetOTP +passwordResetOTPExpires');

    if (!user) {
        throw new AppError('Invalid or expired OTP. Please request a new one.', 400);
    }

    // 2. Update password and clear OTP
    user.passwordHash = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    // 3. Generate new JWT
    const jwtToken = signToken(user._id, user.role);

    logger.info(`Password reset successful for user ${user.email}`);

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.passwordResetOTP;
    delete userResponse.passwordResetOTPExpires;

    return { user: userResponse, token: jwtToken };
};

/**
 * Find or create a user from Google OAuth profile
 * @param {object} profile - Google profile data
 * @returns {Promise<object>} - { user, token }
 */
exports.findOrCreateGoogleUser = async (profile) => {
    const { id: googleId, emails, displayName } = profile;
    const email = emails[0].value;

    // 1. Check if user exists with this Google ID
    let user = await User.findOne({ googleId });
    if (user) {
        const token = signToken(user._id, user.role);
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        return { user: userResponse, token };
    }

    // 2. Check if user exists with this email (link accounts)
    user = await User.findOne({ email });
    if (user) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save({ validateBeforeSave: false });
        const token = signToken(user._id, user.role);
        const userResponse = user.toObject();
        delete userResponse.passwordHash;
        return { user: userResponse, token };
    }

    // 3. Create new user
    const crypto = require('crypto');
    const newUser = await User.create({
        name: displayName || email.split('@')[0],
        email,
        googleId,
        authProvider: 'google',
        passwordHash: crypto.randomBytes(32).toString('hex'), // Random password for Google users
    });

    const token = signToken(newUser._id, newUser.role);
    logger.info(`Google OAuth user created: ${email}`);

    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    return { user: userResponse, token };
};


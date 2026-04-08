/**
 * =============================================================================
 * USER SERVICE
 * =============================================================================
 * Business logic for user profile management.
 * Handles profile retrieval, updates, and account deletion with cascade.
 * =============================================================================
 */

const User = require('../auth/user.model');
const CognitiveTest = require('../cognitive/cognitive.model');
const Result = require('../results/results.model');
const uploadService = require('../upload/upload.service');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

/**
 * Get user profile by ID
 * @param {string} userId - Mongoose User ID
 * @returns {Promise<object>} User document
 */
exports.getProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

/**
 * Update user profile (name and/or email only)
 * @param {string} userId - Mongoose User ID
 * @param {object} updates - { name?, email? }
 * @returns {Promise<object>} Updated user document
 */
exports.updateProfile = async (userId, updates) => {
    // Only allow name and email updates
    const allowedFields = ['name', 'email'];
    const sanitizedUpdates = {};

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            sanitizedUpdates[field] = updates[field];
        }
    }

    // Check if there's anything to update
    if (Object.keys(sanitizedUpdates).length === 0) {
        throw new AppError('No valid fields provided for update', 400);
    }

    // If email is being updated, check for duplicates
    if (sanitizedUpdates.email) {
        const existingUser = await User.findOne({
            email: sanitizedUpdates.email,
            _id: { $ne: userId },
        });

        if (existingUser) {
            throw new AppError('Email already in use by another account', 409);
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
        new: true,           // Return updated document
        runValidators: true, // Run mongoose validators
    });

    if (!updatedUser) {
        throw new AppError('User not found', 404);
    }

    logger.info(`User profile updated: ${updatedUser.email} (ID: ${userId})`);

    return updatedUser;
};

/**
 * Delete user account with cascade deletion of all related data
 * @param {string} userId - Mongoose User ID
 * @returns {Promise<void>}
 */
exports.deleteAccount = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Cascade delete all related data
    const mriCount = await uploadService.deleteAllMRIsByUser(userId);
    const cognitiveResult = await CognitiveTest.deleteMany({ user: userId });
    const predictionResult = await Result.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    logger.info(
        `User account deleted: ${user.email} (ID: ${userId}) — ` +
        `${mriCount} MRIs, ${cognitiveResult.deletedCount} cognitive tests, ` +
        `${predictionResult.deletedCount} predictions cascade-removed`
    );

    return user;
};

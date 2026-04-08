/**
 * =============================================================================
 * REPORT SERVICE
 * =============================================================================
 * Business logic for generating aggregated patient reports.
 * Combines MRI metadata, cognitive tests, and prediction results.
 * =============================================================================
 */

const User = require('../auth/user.model');
const MRI = require('../upload/mri.model');
const CognitiveTest = require('../cognitive/cognitive.model');
const Result = require('../results/results.model');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

/**
 * Generate an aggregated report for a user
 * @param {string} userId - Mongoose User ID
 * @returns {Promise<object>} Aggregated report object
 */
exports.generateReport = async (userId) => {
    // 1. Get user info
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // 2. Get MRI scans
    const mriScans = await MRI.find({ user: userId })
        .sort({ uploadedAt: -1 })
        .select('fileName uploadedAt');

    // 3. Get cognitive tests
    const cognitiveTests = await CognitiveTest.find({ user: userId })
        .sort({ submittedAt: -1 })
        .select('mmseScore mocaScore memoryScore languageScore attentionScore notes submittedAt');

    // 4. Get prediction results
    const predictions = await Result.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('mriScan', 'fileName uploadedAt')
        .populate('cognitiveTest', 'mmseScore mocaScore submittedAt')
        .select('prediction confidence modelVersion details createdAt');

    // 5. Compute summary statistics
    const latestPrediction = predictions.length > 0 ? predictions[0] : null;
    const latestCognitive = cognitiveTests.length > 0 ? cognitiveTests[0] : null;

    const report = {
        generatedAt: new Date().toISOString(),
        patient: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            registeredAt: user.createdAt,
        },
        summary: {
            totalMRIScans: mriScans.length,
            totalCognitiveTests: cognitiveTests.length,
            totalPredictions: predictions.length,
            latestPrediction: latestPrediction
                ? {
                      prediction: latestPrediction.prediction,
                      confidence: latestPrediction.confidence,
                      date: latestPrediction.createdAt,
                  }
                : null,
            latestCognitiveScores: latestCognitive
                ? {
                      mmse: latestCognitive.mmseScore,
                      moca: latestCognitive.mocaScore,
                      memory: latestCognitive.memoryScore,
                      language: latestCognitive.languageScore,
                      attention: latestCognitive.attentionScore,
                      date: latestCognitive.submittedAt,
                  }
                : null,
        },
        mriScans,
        cognitiveTests,
        predictions,
    };

    logger.info(`Report generated for user ${userId}`);

    return report;
};

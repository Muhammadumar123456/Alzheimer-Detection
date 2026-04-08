/**
 * =============================================================================
 * ADMIN SERVICE
 * =============================================================================
 * Business logic for admin-only operations.
 * Handles user listing, removal, stats, reports, and analytics.
 * =============================================================================
 */

const User = require('../auth/user.model');
const MRI = require('../upload/mri.model');
const CognitiveTest = require('../cognitive/cognitive.model');
const Result = require('../results/results.model');
const uploadService = require('../upload/upload.service');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');
const { paginateQuery } = require('../../utils/paginate');

/**
 * List all users with pagination
 */
exports.listUsers = async (paginationParams) => {
    const result = await paginateQuery(
        User,
        {},
        paginationParams,
        {
            select: '-__v',
        }
    );

    return result;
};

/**
 * Remove a user and cascade-delete all related data
 */
exports.removeUser = async (userId, adminId) => {
    if (userId === adminId) {
        throw new AppError('You cannot delete your own admin account', 400);
    }

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
        `Admin cascade-deleted user ${user.email} (ID: ${userId}) — ` +
        `${mriCount} MRIs, ${cognitiveResult.deletedCount} cognitive tests, ` +
        `${predictionResult.deletedCount} predictions removed`
    );

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        cascadeDeleted: {
            mriFiles: mriCount,
            cognitiveTests: cognitiveResult.deletedCount,
            predictions: predictionResult.deletedCount,
        },
    };
};

/**
 * Get dashboard overview stats
 */
exports.getDashboardStats = async () => {
    const [totalUsers, totalMRIs, totalCognitiveTests, totalPredictions] = await Promise.all([
        User.countDocuments(),
        MRI.countDocuments(),
        CognitiveTest.countDocuments(),
        Result.countDocuments(),
    ]);

    // Get role breakdown
    const roleBreakdown = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Recent users (last 5)
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');

    // Recent predictions (last 5)
    const recentPredictions = await Result.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email')
        .select('prediction confidence createdAt');

    return {
        totalUsers,
        totalMRIs,
        totalCognitiveTests,
        totalPredictions,
        roleBreakdown: roleBreakdown.reduce((acc, r) => {
            acc[r._id] = r.count;
            return acc;
        }, {}),
        recentUsers,
        recentPredictions,
    };
};

/**
 * Get all reports (MRI + Cognitive tests across all users)
 */
exports.getAllReports = async (paginationParams) => {
    // Get cognitive tests with user info
    const cognitiveTests = await CognitiveTest.find()
        .sort({ submittedAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .select('mmseScore mocaScore memoryScore languageScore attentionScore submittedAt');

    // Get MRI uploads with user info
    const mriUploads = await MRI.find()
        .sort({ uploadedAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .select('fileName uploadedAt');

    // Get predictions with user info
    const predictions = await Result.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .select('prediction confidence modelVersion createdAt');

    return { cognitiveTests, mriUploads, predictions };
};

/**
 * Get analytics data for charts
 */
exports.getAnalytics = async () => {
    // User registrations over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userRegistrations = await User.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Predictions by type
    const predictionsByType = await Result.aggregate([
        {
            $group: {
                _id: '$prediction',
                count: { $sum: 1 },
            },
        },
    ]);

    // Cognitive test score distribution
    const scoreDistribution = await CognitiveTest.aggregate([
        {
            $group: {
                _id: {
                    $switch: {
                        branches: [
                            { case: { $gte: ['$mmseScore', 24] }, then: 'Normal (24-30)' },
                            { case: { $gte: ['$mmseScore', 18] }, then: 'Mild (18-23)' },
                            { case: { $gte: ['$mmseScore', 10] }, then: 'Moderate (10-17)' },
                        ],
                        default: 'Severe (0-9)',
                    },
                },
                count: { $sum: 1 },
            },
        },
    ]);

    // Monthly tests counts
    const monthlyTests = await CognitiveTest.aggregate([
        { $match: { submittedAt: { $gte: twelveMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$submittedAt' },
                    month: { $month: '$submittedAt' },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Average cognitive scores
    const avgScores = await CognitiveTest.aggregate([
        {
            $group: {
                _id: null,
                avgMMSE: { $avg: '$mmseScore' },
                avgMoCA: { $avg: '$mocaScore' },
                avgMemory: { $avg: '$memoryScore' },
                avgLanguage: { $avg: '$languageScore' },
                avgAttention: { $avg: '$attentionScore' },
            },
        },
    ]);

    return {
        userRegistrations: userRegistrations.map((r) => ({
            month: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
            count: r.count,
        })),
        predictionsByType: predictionsByType.map((p) => ({
            type: p._id,
            count: p.count,
        })),
        scoreDistribution: scoreDistribution.map((s) => ({
            range: s._id,
            count: s.count,
        })),
        monthlyTests: monthlyTests.map((t) => ({
            month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
            count: t.count,
        })),
        averageScores: avgScores[0] || {
            avgMMSE: 0,
            avgMoCA: 0,
            avgMemory: 0,
            avgLanguage: 0,
            avgAttention: 0,
        },
    };
};

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
 * Create a new user manually (Admin only)
 */
exports.createUser = async (userData) => {
    const { name, email, role, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('A user with this email already exists', 409);
    }

    // Create user
    const newUser = await User.create({
        name,
        email,
        role,
        passwordHash: password, // Map 'password' from request to 'passwordHash' for the model
    });

    // Remove password from response
    newUser.password = undefined;

    return newUser;
};

/**
 * Update user details (Admin only)
 */
exports.updateUser = async (userId, updateData) => {
    const { name, email, role } = updateData;

    // If email is being updated, check if it's already taken
    if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            throw new AppError('Email is already in use by another account', 409);
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { name, email, role },
        { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
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
    // Get cognitive tests with user info and linked results
    const cognitiveTests = await CognitiveTest.find()
        .sort({ submittedAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .populate({
            path: 'result',
            select: 'prediction confidence'
        })
        .select('mmseScore mocaScore memoryScore languageScore attentionScore submittedAt result');

    // Get MRI uploads with full info and linked results
    const mriUploads = await MRI.find()
        .sort({ uploadedAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .populate({
            path: 'result',
            select: 'prediction confidence'
        })
        .select('fileName filePath storageType fileSize mimeType uploadedAt result');

    // Get predictions with full related info
    const predictions = await Result.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('user', 'name email')
        .populate('mriScan', 'fileName filePath storageType fileSize mimeType')
        .populate('cognitiveTest', 'mmseScore totalScore memoryScore attentionScore languageScore')
        .select('prediction confidence modelVersion processingTimeMs createdAt mriScan cognitiveTest classProbabilities');

    return { cognitiveTests, mriUploads, predictions };
};

/**
 * Get analytics data for charts
 */
exports.getAnalytics = async (range = '12m') => {
    // Calculate date filter based on range
    const startDate = new Date();
    let dateFilter = {};

    if (range === '3m') {
        startDate.setMonth(startDate.getMonth() - 3);
        dateFilter = { createdAt: { $gte: startDate } };
    } else if (range === '6m') {
        startDate.setMonth(startDate.getMonth() - 6);
        dateFilter = { createdAt: { $gte: startDate } };
    } else if (range === '12m') {
        startDate.setMonth(startDate.getMonth() - 12);
        dateFilter = { createdAt: { $gte: startDate } };
    } else if (range === 'all') {
        dateFilter = {}; // No filter for all time
    }

    // User registrations over time
    const userRegistrations = await User.aggregate([
        { $match: dateFilter },
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

    const submittedDateFilter = range === 'all' ? {} : { submittedAt: { $gte: startDate } };

    // Predictions by type
    const predictionsByType = await Result.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$prediction',
                count: { $sum: 1 },
            },
        },
    ]);

    // Cognitive test score distribution
    const scoreDistribution = await CognitiveTest.aggregate([
        { $match: submittedDateFilter },
        {
            $project: {
                effectiveScore: { $ifNull: ['$totalScore', '$mmseScore'] }
            }
        },
        {
            $group: {
                _id: {
                    $switch: {
                        branches: [
                            { case: { $gte: ['$effectiveScore', 24] }, then: 'Normal (24-30)' },
                            { case: { $gte: ['$effectiveScore', 18] }, then: 'Mild (18-23)' },
                            { case: { $gte: ['$effectiveScore', 10] }, then: 'Moderate (10-17)' },
                        ],
                        default: 'Severe (0-9)',
                    },
                },
                count: { $sum: 1 },
            },
        },
    ]);

    // Average cognitive scores
    const avgScores = await CognitiveTest.aggregate([
        { $match: submittedDateFilter },
        {
            $group: {
                _id: null,
                avgMMSE: { $avg: { $ifNull: ['$totalScore', '$mmseScore'] } },
                avgMoCA: { $avg: '$mocaScore' },
                avgMemory: { $avg: '$memoryScore' },
                avgLanguage: { $avg: '$languageScore' },
                avgAttention: { $avg: '$attentionScore' },
            },
        },
    ]);

    // Sort order for ranges to keep chart logical
    const rangeOrder = { 'Normal (24-30)': 4, 'Mild (18-23)': 3, 'Moderate (10-17)': 2, 'Severe (0-9)': 1 };

    return {
        userRegistrations: userRegistrations.map((r) => ({
            month: new Date(r._id.year, r._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
            count: r.count,
        })),
        predictionsByType: predictionsByType.map((p) => ({
            type: p._id || 'Pending',
            count: p.count,
        })).sort((a, b) => b.count - a.count),
        scoreDistribution: scoreDistribution.map((s) => ({
            range: s._id,
            count: s.count,
        })).sort((a, b) => rangeOrder[b.range] - rangeOrder[a.range]),
        averageScores: avgScores[0] || {
            avgMMSE: 0,
            avgMoCA: 0,
            avgMemory: 0,
            avgLanguage: 0,
            avgAttention: 0,
        },
    };
};

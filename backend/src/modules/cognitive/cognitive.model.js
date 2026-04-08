/**
 * =============================================================================
 * COGNITIVE TEST MODEL
 * =============================================================================
 * Mongoose schema for cognitive assessment test results.
 * Stores standardized scores from various cognitive screening tools.
 * =============================================================================
 */

const mongoose = require('mongoose');

const cognitiveTestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },
        mmseScore: {
            type: Number,
            required: [true, 'MMSE score is required'],
            min: [0, 'MMSE score cannot be less than 0'],
            max: [30, 'MMSE score cannot exceed 30'],
        },
        mocaScore: {
            type: Number,
            required: [true, 'MoCA score is required'],
            min: [0, 'MoCA score cannot be less than 0'],
            max: [30, 'MoCA score cannot exceed 30'],
        },
        memoryScore: {
            type: Number,
            required: [true, 'Memory score is required'],
            min: [0, 'Memory score cannot be less than 0'],
            max: [100, 'Memory score cannot exceed 100'],
        },
        languageScore: {
            type: Number,
            required: [true, 'Language score is required'],
            min: [0, 'Language score cannot be less than 0'],
            max: [100, 'Language score cannot exceed 100'],
        },
        attentionScore: {
            type: Number,
            required: [true, 'Attention score is required'],
            min: [0, 'Attention score cannot be less than 0'],
            max: [100, 'Attention score cannot exceed 100'],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        mriUpload: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MRI',
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const CognitiveTest = mongoose.model('CognitiveTest', cognitiveTestSchema);

module.exports = CognitiveTest;

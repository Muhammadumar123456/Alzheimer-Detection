/**
 * =============================================================================
 * COGNITIVE TEST MODEL
 * =============================================================================
 * Mongoose schema for cognitive assessment results.
 *
 * Primary input:  rawAnswers — 30 binary (0/1) values matching the ML model's
 *                 training questionnaire order.
 * Derived fields: mmseScore, mocaScore, memoryScore, languageScore,
 *                 attentionScore, totalScore — auto-computed in the service
 *                 layer from rawAnswers.
 *
 * Older documents (pre-ML) may lack rawAnswers and only have derived scores.
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

        // =====================================================================
        // PRIMARY INPUT — 30 binary answers for the ML fusion model
        // =====================================================================
        rawAnswers: {
            type: [Number],
            validate: {
                validator: function (arr) {
                    return arr.length === 30 && arr.every((v) => v === 0 || v === 1);
                },
                message: 'rawAnswers must contain exactly 30 values, each 0 or 1',
            },
        },

        // =====================================================================
        // DERIVED SCORES — auto-computed from rawAnswers (server-side)
        // Not required because older records may only have these fields.
        // =====================================================================
        totalScore: {
            type: Number,
            min: [0, 'Total score cannot be less than 0'],
            max: [30, 'Total score cannot exceed 30'],
        },
        mmseScore: {
            type: Number,
            min: [0, 'MMSE score cannot be less than 0'],
            max: [30, 'MMSE score cannot exceed 30'],
        },
        mocaScore: {
            type: Number,
            min: [0, 'MoCA score cannot be less than 0'],
            max: [30, 'MoCA score cannot exceed 30'],
        },
        memoryScore: {
            type: Number,
            min: [0, 'Memory score cannot be less than 0'],
            max: [100, 'Memory score cannot exceed 100'],
        },
        languageScore: {
            type: Number,
            min: [0, 'Language score cannot be less than 0'],
            max: [100, 'Language score cannot exceed 100'],
        },
        attentionScore: {
            type: Number,
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

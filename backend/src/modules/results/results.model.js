/**
 * =============================================================================
 * RESULTS MODEL (Prediction Results)
 * =============================================================================
 * Mongoose schema for ML prediction results.
 * Links user, MRI scan, cognitive test, and model output together.
 * =============================================================================
 */

const mongoose = require('mongoose');

const resultsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },
        mriScan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MRI',
            required: [true, 'MRI scan reference is required'],
        },
        cognitiveTest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CognitiveTest',
            required: [true, 'Cognitive test reference is required'],
        },
        prediction: {
            type: String,
            required: [
                function () {
                    return this.status === 'completed';
                },
                'Prediction class is required for completed results',
            ],
            enum: {
                values: ['AD', 'CN', 'EMCI', 'LMCI'],
                message: '{VALUE} is not a valid prediction. Use AD, CN, EMCI, or LMCI.',
            },
        },
        confidence: {
            type: Number,
            required: [
                function () {
                    return this.status === 'completed';
                },
                'Confidence score is required for completed results',
            ],
            min: [0, 'Confidence cannot be less than 0'],
            max: [1, 'Confidence cannot exceed 1'],
        },
        classProbabilities: {
            AD:   { type: Number, min: 0, max: 1 },
            CN:   { type: Number, min: 0, max: 1 },
            EMCI: { type: Number, min: 0, max: 1 },
            LMCI: { type: Number, min: 0, max: 1 },
        },
        modelVersion: {
            type: String,
            default: '1.0.0',
            trim: true,
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'completed', 'failed'],
                message: '{VALUE} is not a valid prediction status.',
            },
            default: 'completed',
            index: true,
        },
        retryCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        errorMessage: {
            type: String,
            trim: true,
        },
        processingTimeMs: {
            type: Number,
            min: 0,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        createdAt: {
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

const Result = mongoose.model('Result', resultsSchema);

module.exports = Result;

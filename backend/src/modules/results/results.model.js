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
            required: [true, 'Prediction class is required'],
            enum: {
                values: ['CN', 'MCI', 'AD'],
                message: '{VALUE} is not a valid prediction. Use CN, MCI, or AD.',
            },
        },
        confidence: {
            type: Number,
            required: [true, 'Confidence score is required'],
            min: [0, 'Confidence cannot be less than 0'],
            max: [1, 'Confidence cannot exceed 1'],
        },
        modelVersion: {
            type: String,
            default: '1.0.0',
            trim: true,
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

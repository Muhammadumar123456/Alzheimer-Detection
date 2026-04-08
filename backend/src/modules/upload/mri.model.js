/**
 * =============================================================================
 * MRI MODEL
 * =============================================================================
 * Mongoose schema for MRI scan upload metadata.
 * Tracks which user uploaded which file, and where it's stored.
 * =============================================================================
 */

const mongoose = require('mongoose');

const mriSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true,
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
            trim: true,
        },
        filePath: {
            type: String,
            required: [true, 'File path is required'],
        },
        uploadedAt: {
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

const MRI = mongoose.model('MRI', mriSchema);

module.exports = MRI;

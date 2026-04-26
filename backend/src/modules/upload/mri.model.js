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
        mimeType: {
            type: String,
            default: 'image/jpeg',
        },
        fileSize: {
            type: Number, // in bytes
        },
        storageType: {
            type: String,
            enum: ['local', 'cloudinary', 's3'],
            default: 'local',
        },
        cloudinaryPublicId: {
            type: String,
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        toJSON: {
            virtuals: true,
            getters: true,
            transform: function (doc, ret) {
                delete ret.filePath; // Hide internal filesystem paths from API response
                return ret;
            },
        },
        toObject: { virtuals: true, getters: true },
        timestamps: true,
    }
);

/**
 * Virtual for serving the file URL to the frontend.
 * If storage is local, it generates a relative API URL.
 */
mriSchema.virtual('fileUrl').get(function () {
    if (this.storageType === 'local') {
        const normalized = this.filePath.replace(/\\/g, '/');
        // Extract everything from 'uploads/' onwards to fix old absolute paths saved in the database
        const uploadsIndex = normalized.indexOf('uploads/');
        if (uploadsIndex !== -1) {
            return `/${normalized.substring(uploadsIndex)}`;
        }
        return `/${normalized}`;
    }
    // For cloud storage, filePath would be the full URL
    return this.filePath;
});

/**
 * Virtual to link to the AI prediction result for this MRI
 */
mriSchema.virtual('result', {
    ref: 'Result',
    localField: '_id',
    foreignField: 'mriScan',
    justOne: true
});

const MRI = mongoose.model('MRI', mriSchema);

module.exports = MRI;

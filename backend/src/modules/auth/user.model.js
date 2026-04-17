/**
 * =============================================================================
 * USER MODEL
 * =============================================================================
 * Mongoose schema for User accounts with password hashing and roles.
 * =============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please provide a valid email address',
            ],
        },
        passwordHash: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password hash by default in queries
        },
        role: {
            type: String,
            enum: {
                values: ['patient', 'clinician', 'admin'],
                message: '{VALUE} is not a valid role',
            },
            default: 'patient',
            index: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
        passwordResetOTP: {
            type: String,
            select: false,
        },
        passwordResetOTPExpires: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// =============================================================================
// INDEXES
// =============================================================================

// Index createdAt for efficient sorting (e.g., admin user listing)
// email already has a unique index; role already has index: true in schema
userSchema.index({ createdAt: -1 });

// =============================================================================
// VIRTUALS
// =============================================================================

/**
 * Ensure 'id' virtual maps to '_id'
 */
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// =============================================================================
// PRE-SAVE HOOKS
// =============================================================================

/**
 * Hash password before saving if it has been modified
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('passwordHash')) return next();

    try {
        // Generate salt and hash
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Check if provided password matches the hashed password in DB
 * @param {string} candidatePassword - Password provided by user
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

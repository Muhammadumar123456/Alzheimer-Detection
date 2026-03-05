/**
 * =============================================================================
 * AUTH SERVICE
 * =============================================================================
 * Business logic for user registration and authentication.
 * Handles JWT generation and password verification.
 * =============================================================================
 */

const jwt = require('jsonwebtoken');
const User = require('./user.model');
const config = require('../../config');
const AppError = require('../../utils/AppError');

/**
 * Generate a JWT token for a user
 * @param {string} userId - Mongoose User ID
 * @param {string} role - User role (patient/clinician/admin)
 * @returns {string} JWT Token
 */
const signToken = (userId, role) => {
    return jwt.sign({ id: userId, role }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

/**
 * Register a new user
 * @param {object} userData - { name, email, password }
 * @returns {Promise<object>} - { user, token }
 */
exports.registerUser = async (userData) => {
    const { name, email, password } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already in use. Please try another one.', 409);
    }

    // 2. Create new user
    // Password hashing is handled by the pre-save hook in user.model.js
    const newUser = await User.create({
        name,
        email,
        passwordHash: password,
    });

    // 3. Generate token
    const token = signToken(newUser._id, newUser.role);

    // 4. Prepare response (passwordHash is select:false, so it's already excluded)
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    return {
        user: userResponse,
        token,
    };
};

/**
 * Login an existing user
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { user, token }
 */
exports.loginUser = async (credentials) => {
    const { email, password } = credentials;

    // 1. Verify existence and compare password
    // We explicitly select +passwordHash because it's hidden by default
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
    }

    // 2. Generate token
    const token = signToken(user._id, user.role);

    // 3. Prepare response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    return {
        user: userResponse,
        token,
    };
};

/**
 * Get user by ID (helper)
 * @param {string} id - User ID
 * @returns {Promise<User>}
 */
exports.getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User no longer exists', 404);
    }
    return user;
};

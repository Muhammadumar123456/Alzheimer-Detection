/**
 * =============================================================================
 * INPUT VALIDATION MIDDLEWARE
 * =============================================================================
 * Lightweight schema-based request body validation.
 * No external library — uses plain JS objects as schemas.
 *
 * Usage:
 *   const { validate, schemas } = require('./validate');
 *   router.post('/register', validate(schemas.register), controller.register);
 * =============================================================================
 */

const { sendError } = require('../utils/responseHelper');

// =========================================================================
// VALIDATION SCHEMAS
// =========================================================================

const schemas = {
    register: {
        name: {
            required: true,
            type: 'string',
            minLength: 2,
            maxLength: 50,
            label: 'Name',
        },
        email: {
            required: true,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
        password: {
            required: true,
            type: 'string',
            minLength: 8,
            passwordMatch: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`])/,
            label: 'Password',
        },
    },

    login: {
        email: {
            required: true,
            type: 'string',
            label: 'Email',
        },
        password: {
            required: true,
            type: 'string',
            label: 'Password',
        },
    },

    updateProfile: {
        name: {
            required: false,
            type: 'string',
            minLength: 2,
            maxLength: 50,
            label: 'Name',
        },
        email: {
            required: false,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
    },

    cognitiveSubmit: {
        rawAnswers: {
            required: true,
            isArray: true,
            arrayLength: 30,
            arrayItemValues: [0, 1],
            label: 'Cognitive Answers',
        },
    },

    storePrediction: {
        mriScanId: {
            required: true,
            type: 'string',
            label: 'MRI Scan ID',
        },
        cognitiveTestId: {
            required: true,
            type: 'string',
            label: 'Cognitive Test ID',
        },
        prediction: {
            required: true,
            type: 'string',
            label: 'Prediction',
        },
        confidence: {
            required: true,
            type: 'number',
            min: 0,
            max: 1,
            label: 'Confidence',
        },
    },

    predict: {
        mriScanId: {
            required: true,
            type: 'string',
            label: 'MRI Scan ID',
        },
        cognitiveTestId: {
            required: true,
            type: 'string',
            label: 'Cognitive Test ID',
        },
    },

    changePassword: {
        currentPassword: {
            required: true,
            type: 'string',
            label: 'Current Password',
        },
        newPassword: {
            required: true,
            type: 'string',
            minLength: 8,
            passwordMatch: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`])/,
            label: 'New Password',
        },
    },

    contact: {
        name: {
            required: true,
            type: 'string',
            minLength: 2,
            maxLength: 100,
            label: 'Name',
        },
        email: {
            required: true,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
        subject: {
            required: true,
            type: 'string',
            minLength: 3,
            maxLength: 200,
            label: 'Subject',
        },
        message: {
            required: true,
            type: 'string',
            minLength: 10,
            maxLength: 2000,
            label: 'Message',
        },
    },

    forgotPassword: {
        email: {
            required: true,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
    },

    resetPassword: {
        email: {
            required: true,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
        otp: {
            required: true,
            type: 'string',
            label: 'Reset OTP',
        },
        newPassword: {
            required: true,
            type: 'string',
            minLength: 8,
            passwordMatch: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`])/,
            label: 'New Password',
        },
    },

    adminCreateUser: {
        name: {
            required: true,
            type: 'string',
            match: /^[a-zA-Z\s]+$/,
            minLength: 2,
            maxLength: 50,
            label: 'Name',
        },
        email: {
            required: true,
            type: 'string',
            // match should include domain restrictions if we want to be strict, 
            // but let's at least match the standard format and let Mongoose handle the domain for now 
            // OR update the regex to be more restrictive.
            // For now, I'll just add the passwordMatch.
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
        role: {
            required: true,
            type: 'string',
            label: 'Role',
        },
        password: {
            required: true,
            type: 'string',
            minLength: 8,
            passwordMatch: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`])/,
            label: 'Password',
        },
    },

    adminUpdateUser: {
        name: {
            required: false,
            type: 'string',
            minLength: 2,
            maxLength: 50,
            label: 'Name',
        },
        email: {
            required: false,
            type: 'string',
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            label: 'Email',
        },
        role: {
            required: false,
            type: 'string',
            label: 'Role',
        },
    },
};

// =========================================================================
// VALIDATION ENGINE
// =========================================================================

/**
 * Validate a value against a single field rule.
 * @param {string} field - Field name
 * @param {*} value - Value from req.body
 * @param {object} rules - Validation rules for this field
 * @returns {string|null} - Error message or null
 */
const validateField = (field, value, rules) => {
    const label = rules.label || field;

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
        return `${label} is required`;
    }

    // If field is not required and not provided, skip further checks
    if (value === undefined || value === null || value === '') {
        return null;
    }

    // Type check
    if (rules.type && typeof value !== rules.type) {
        return `${label} must be a ${rules.type}`;
    }

    // String-specific checks
    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (rules.minLength && trimmed.length < rules.minLength) {
            return `${label} must be at least ${rules.minLength} characters`;
        }

        if (rules.maxLength && trimmed.length > rules.maxLength) {
            return `${label} must not exceed ${rules.maxLength} characters`;
        }

        if (rules.match && !rules.match.test(trimmed)) {
            return `${label} is not valid`;
        }

        if (rules.passwordMatch && !rules.passwordMatch.test(trimmed)) {
            return `${label} must contain at least one uppercase letter, one lowercase letter, one number, and one special character`;
        }
    }

    // Number-specific checks
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            return `${label} must be at least ${rules.min}`;
        }

        if (rules.max !== undefined && value > rules.max) {
            return `${label} must not exceed ${rules.max}`;
        }
    }

    // Array-specific checks
    if (rules.isArray) {
        if (!Array.isArray(value)) {
            return `${label} must be an array`;
        }

        if (rules.arrayLength !== undefined && value.length !== rules.arrayLength) {
            return `${label} must contain exactly ${rules.arrayLength} items`;
        }

        if (rules.arrayItemValues && !value.every((item) => rules.arrayItemValues.includes(item))) {
            return `${label} contains invalid values. Allowed: ${rules.arrayItemValues.join(', ')}`;
        }
    }

    return null;
};

// =========================================================================
// MIDDLEWARE FACTORY
// =========================================================================

/**
 * Returns Express middleware that validates req.body against the given schema.
 * @param {object} schema - Validation schema object
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const error = validateField(field, req.body[field], rules);
            if (error) {
                errors.push({ field, message: error });
            }
        }

        if (errors.length > 0) {
            // Return the first error message as the primary message for better UX
            return sendError(res, 400, errors[0].message, errors);
        }

        next();
    };
};

module.exports = { validate, schemas };

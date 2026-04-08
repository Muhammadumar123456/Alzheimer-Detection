/**
 * =============================================================================
 * CONTACT CONTROLLER
 * =============================================================================
 * Handles contact form submissions.
 * =============================================================================
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');
const { sendContactEmail } = require('../../utils/emailService');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

/**
 * Submit contact form
 * POST /api/contact
 */
exports.submitContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        throw new AppError('All fields are required (name, email, subject, message)', 400);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        throw new AppError('Please provide a valid email address', 400);
    }

    await sendContactEmail({ name, email, subject, message });

    logger.info(`Contact form submitted by ${email}: ${subject}`);

    sendSuccess(res, 200, 'Your message has been sent successfully. We will get back to you soon.');
});

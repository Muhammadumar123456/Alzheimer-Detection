/**
 * =============================================================================
 * CONTACT CONTROLLER
 * =============================================================================
 * Handles contact form submissions.
 * Input validation is handled by the validate middleware in contact.routes.js.
 * =============================================================================
 */

const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');
const { sendContactEmail } = require('../../utils/emailService');
const logger = require('../../config/logger');

/**
 * Submit contact form
 * POST /api/contact
 */
exports.submitContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    await sendContactEmail({ name, email, subject, message });

    logger.info(`Contact form submitted by ${email}: ${subject}`);

    sendSuccess(res, 200, 'Your message has been sent successfully. We will get back to you soon.');
});

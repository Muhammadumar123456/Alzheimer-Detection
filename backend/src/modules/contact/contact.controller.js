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

    logger.info(`Processing contact form submission from: ${email}`);
    const emailResult = await sendContactEmail({ name, email, subject, message });

    logger.info(`Contact form submitted successfully`, {
        from: email,
        subject,
        messageId: emailResult?.messageId
    });

    sendSuccess(res, 200, 'Your message has been sent successfully. We will get back to you soon.');
});

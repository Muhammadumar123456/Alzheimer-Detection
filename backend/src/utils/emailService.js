/**
 * =============================================================================
 * EMAIL SERVICE
 * =============================================================================
 * Nodemailer-based email utility.
 * In development mode without SMTP config, logs emails to console.
 * =============================================================================
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Create mail transporter
 * Falls back to console logging in dev if no SMTP credentials
 */
const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user, pass },
        });
    }

    // Dev fallback — no real SMTP
    logger.warn('SMTP not configured. Emails will be logged to console.');
    return null;
};

const transporter = createTransporter();

/**
 * Send an email
 * @param {object} options - { to, subject, text, html }
 * @returns {Promise<void>}
 */
exports.sendEmail = async ({ to, subject, text, html }) => {
    const from = process.env.SMTP_FROM || '"AlzDetect System" <noreply@alzdetect.com>';

    if (transporter) {
        const info = await transporter.sendMail({ from, to, subject, text, html });
        logger.info(`Email sent: ${info.messageId} to ${to}`);
        return info;
    }

    // Fallback: log to console
    logger.info('=== DEV EMAIL (not actually sent) ===');
    logger.info(`To: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Body: ${text || html}`);
    logger.info('=== END DEV EMAIL ===');
    return { messageId: 'dev-mode', to, subject };
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Full reset URL with token
 */
exports.sendPasswordResetEmail = async (email, resetUrl) => {
    const subject = 'Password Reset — AlzDetect';
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin: 0;">🧠 AlzDetect</h1>
                <p style="color: #6b7280; margin-top: 5px;">Early Alzheimer Disease Detection System</p>
            </div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #4b5563; line-height: 1.6;">
                    You requested a password reset. Click the button below to set a new password.
                    This link will expire in <strong>10 minutes</strong>.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    If you didn't request this, please ignore this email. Your password will remain unchanged.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px;">
                    If the button doesn't work, copy and paste this URL: ${resetUrl}
                </p>
            </div>
        </div>
    `;
    const text = `Password Reset\n\nYou requested a password reset. Visit this link to set a new password (expires in 10 minutes):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`;

    await exports.sendEmail({ to: email, subject, text, html });
};

/**
 * Send contact form email
 * @param {object} data - { name, email, subject, message }
 */
exports.sendContactEmail = async ({ name, email, subject, message }) => {
    const adminEmail = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER || 'admin@alzdetect.com';
    const mailSubject = `Contact Form: ${subject}`;
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin: 0;">🧠 AlzDetect — Contact Form</h1>
            </div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin-top: 0;">New Contact Message</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name:</td><td style="padding: 8px 0; color: #1f2937;">${name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td><td style="padding: 8px 0; color: #1f2937;">${email}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td><td style="padding: 8px 0; color: #1f2937;">${subject}</td></tr>
                </table>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #1f2937; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `;
    const text = `Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;

    await exports.sendEmail({ to: adminEmail, subject: mailSubject, text, html });
};

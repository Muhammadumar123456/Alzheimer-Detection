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
        const port = parseInt(process.env.SMTP_PORT, 10) || 587;
        const secure = process.env.SMTP_SECURE === 'true' || port === 465;

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            // Add extra timeout for stability
            connectionTimeout: 10000,
            greetingTimeout: 5000,
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
 * Send password reset email with OTP
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
exports.sendPasswordResetEmail = async (email, otp) => {
    const subject = 'Your Password Reset Code — AlzDetect';
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin: 0;">🧠 AlzDetect</h1>
                <p style="color: #6b7280; margin-top: 5px;">Early Alzheimer Disease Detection System</p>
            </div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Verification Code</h2>
                <p style="color: #4b5563; line-height: 1.6; text-align: center;">
                    You requested a password reset. Use the 6-digit code below to set a new password.
                    This code will expire in <strong>10 minutes</strong>.
                </p>
                <div style="text-align: center; margin: 40px 0;">
                    <div style="background: #ffffff; color: #4f46e5; border: 2px dashed #4f46e5; font-size: 36px; font-weight: 800; letter-spacing: 12px; padding: 20px; display: inline-block; border-radius: 12px;">
                        ${otp}
                    </div>
                </div>
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                    If you didn't request this, please ignore this email. Your password will remain unchanged.
                </p>
            </div>
        </div>
    `;
    const text = `Password Reset Code: ${otp}\n\nYou requested a password reset. Use this code to set a new password (expires in 10 minutes): ${otp}\n\nIf you didn't request this, ignore this email.`;

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

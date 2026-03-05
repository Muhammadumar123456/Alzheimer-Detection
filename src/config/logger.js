/**
 * =============================================================================
 * WINSTON LOGGER
 * =============================================================================
 * Structured logging with console (dev) and file (production) transports.
 * =============================================================================
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const config = require('./index');

const { combine, timestamp, printf, colorize, errors } = format;

// --- Custom log format ---
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return stack
        ? `${timestamp} [${level}]: ${message}\n${stack}`
        : `${timestamp} [${level}]: ${message}`;
});

// --- Create logger instance ---
const logger = createLogger({
    level: config.logging.level,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Always log to console
        new transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
    // Don't exit on uncaught exceptions — let the process handler deal with it
    exitOnError: false,
});

// --- Add file transport in production ---
if (config.env === 'production') {
    const logDir = path.resolve(config.logging.dir);

    logger.add(
        new transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        })
    );

    logger.add(
        new transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        })
    );
}

module.exports = logger;

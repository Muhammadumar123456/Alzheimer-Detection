/**
 * =============================================================================
 * WINSTON LOGGER
 * =============================================================================
 * Structured logging with console (dev) and file (production) transports.
 * Includes request metadata formatting and environment-aware output.
 * =============================================================================
 */

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('./index');

const { combine, timestamp, printf, colorize, errors, json } = format;

// --- Custom log format for console (human-readable) ---
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;

    // Append metadata if present (e.g., userId, method, url)
    const metaKeys = Object.keys(meta);
    if (metaKeys.length > 0) {
        const metaStr = metaKeys.map((k) => `${k}=${meta[k]}`).join(' ');
        log += ` | ${metaStr}`;
    }

    return log;
});

// --- Create logger instance ---
const logger = createLogger({
    level: config.logging.level,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    defaultMeta: { service: 'alzheimer-api' },
    transports: [
        // Console transport — colorized in dev, JSON in production
        new transports.Console({
            format:
                config.env === 'production'
                    ? combine(json())
                    : combine(colorize(), consoleFormat),
        }),
    ],
    exitOnError: false,
});

// --- Add file transports in production ---
if (config.env === 'production') {
    const logDir = path.resolve(config.logging.dir);

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    logger.add(
        new transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
            format: combine(json()),
        })
    );

    logger.add(
        new transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
            format: combine(json()),
        })
    );
}

module.exports = logger;

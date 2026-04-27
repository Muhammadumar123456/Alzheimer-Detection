/**
 * =============================================================================
 * SERVER ENTRYPOINT
 * =============================================================================
 * Starts the Express server after connecting to the database.
 * Handles uncaught exceptions and unhandled rejections gracefully.
 * =============================================================================
 */

const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const connectDB = require('./config/database');

// =========================================================================
// HANDLE UNCAUGHT EXCEPTIONS (synchronous bugs)
// =========================================================================
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION — shutting down...', {
        error: err.message,
        stack: err.stack,
    });
    process.exit(1);
});

// =========================================================================
// START SERVER
// =========================================================================
const startServer = async () => {
    try {
        // 1. Connect to database
        await connectDB();
        logger.info('Database connected successfully');

        // 2. Start listening
        const server = app.listen(config.port, () => {
            logger.info('Server started', {
                environment: config.env,
                port: config.port,
                api: `http://localhost:${config.port}${config.apiPrefix}`,
                health: `http://localhost:${config.port}${config.apiPrefix}/health`,
            });
            logger.info(
                `\n  ================================================\n` +
                `    Server running in ${config.env} mode\n` +
                `    Port: ${config.port}\n` +
                `    API:  http://localhost:${config.port}${config.apiPrefix}\n` +
                `  ================================================\n`
            );
        });

        // -------------------------------------------------------------------
        // HANDLE UNHANDLED PROMISE REJECTIONS
        // -------------------------------------------------------------------
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED REJECTION — shutting down...', {
                error: err.message,
                stack: err.stack,
            });

            // Gracefully close server, then exit
            server.close(() => {
                process.exit(1);
            });
        });

        // -------------------------------------------------------------------
        // HANDLE SIGTERM (graceful shutdown for cloud deployments)
        // -------------------------------------------------------------------
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
            });
        });

        // -------------------------------------------------------------------
        // HANDLE SIGINT (Ctrl+C — graceful local shutdown)
        // -------------------------------------------------------------------
        process.on('SIGINT', () => {
            logger.info('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                logger.info('Process terminated');
                process.exit(0);
            });
        });
    } catch (err) {
        logger.error('Failed to start server', {
            error: err.message,
            stack: err.stack,
        });
        process.exit(1);
    }
};

startServer();

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
    logger.error(`UNCAUGHT EXCEPTION: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
});

// =========================================================================
// START SERVER
// =========================================================================
const startServer = async () => {
    // 1. Connect to database
    await connectDB();

    // 2. Start listening
    const server = app.listen(config.port, () => {
        logger.info(`
    ================================================
      Server running in ${config.env} mode
      Port: ${config.port}
      API:  http://localhost:${config.port}${config.apiPrefix}
    ================================================
    `);
    });

    // -----------------------------------------------------------------------
    // HANDLE UNHANDLED PROMISE REJECTIONS
    // -----------------------------------------------------------------------
    process.on('unhandledRejection', (err) => {
        logger.error(`UNHANDLED REJECTION: ${err.message}`);
        logger.error(err.stack);

        // Gracefully close server, then exit
        server.close(() => {
            process.exit(1);
        });
    });

    // -----------------------------------------------------------------------
    // HANDLE SIGTERM (graceful shutdown for cloud deployments)
    // -----------------------------------------------------------------------
    process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            logger.info('Process terminated');
        });
    });
};

startServer();

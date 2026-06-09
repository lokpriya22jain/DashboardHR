const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Natively saves the error trace to logs/errors.log via Winston
    logger.error(`[Error Middleware] Status ${statusCode}: ${err.message} \nStack: ${err.stack}`);

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: err.message || 'Internal Server Error encountered in Enterprise Core.',
    });
};

module.exports = errorHandler;
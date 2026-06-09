const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: '2026-01-02 15:04:05' }),
        winston.format.json()
    ),
    transports: [
        // Write all error logs permanently to errors.log
        new winston.transports.File({ 
            filename: path.join(__dirname, '../../logs/errors.log'), 
            level: 'error' 
        }),
        // Write all general info/warning pipelines to combined.log
        new winston.transports.File({ 
            filename: path.join(__dirname, '../../logs/combined.log') 
        }),
        // Also print cleanly to the terminal console during development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

module.exports = logger;
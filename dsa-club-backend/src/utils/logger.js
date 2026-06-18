import winston from 'winston';
import config from '../config/config.js';

const logger = winston.createLogger({
    level: config.server.isDev ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: config.server.isDev
                ? winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
                : winston.format.json()
        }),
        ...(config.server.isProd
            ? [new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error'
            })]
            : [])
    ]
});

export default logger;
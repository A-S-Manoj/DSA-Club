import rateLimit from 'express-rate-limit';
import config from '../config/config.js';

const createLimiter = (max) => rateLimit({
    windowMs: config.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests, please try again later'
            }
        });
    }
});

export const authLimiter = createLimiter(config.rateLimit.maxAuth);
export const messageLimiter = createLimiter(config.rateLimit.maxMessage);
export const importLimiter = createLimiter(config.rateLimit.maxImport);
export const generalLimiter = createLimiter(config.rateLimit.maxGeneral);
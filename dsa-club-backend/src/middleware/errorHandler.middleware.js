import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error({
        code: err.code || 'UNKNOWN',
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?._id || 'unauthenticated'
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.data !== undefined && err.data !== null && { data: err.data })
            }
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: err.message }
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: { code: 'AUTH_EMAIL_EXISTS', message: 'Email already exists' }
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Invalid ${err.path} format` }
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_TOKEN_INVALID', message: 'Invalid token' }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: { code: 'AUTH_TOKEN_EXPIRED', message: 'Token has expired' }
        });
    }

    return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' }
    });
};

export default errorHandler;
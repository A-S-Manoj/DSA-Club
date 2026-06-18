import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

const validate = schema => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            const message = err.errors
                .map(e => `${e.path.join('.')}: ${e.message}`)
                .join(', ');
            return next(new AppError(400, 'VALIDATION_ERROR', message));
        }
        next(err);
    }
};

export default validate;
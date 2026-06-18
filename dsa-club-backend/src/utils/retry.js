import AppError from './AppError.js';
import logger from './logger.js';

const retryWithBackoff = async (fn, retries = 1, delay = 1000) => {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) {
            logger.error({ message: 'AI call failed after retry', error: err.message });
            throw new AppError(503, 'AI_SERVICE_UNAVAILABLE', 'AI service is temporarily unavailable');
        }
        logger.warn({ message: `AI call failed, retrying in ${delay}ms`, retriesLeft: retries });
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay);
    }
};

export default retryWithBackoff;
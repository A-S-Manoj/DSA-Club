import { Router } from 'express';
import * as configController from '../controllers/config.controller.js';
import protect from '../middleware/auth.middleware.js';
import { generalLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.get('/speech-token',
    protect,
    generalLimiter,
    configController.getSpeechToken
);

export default router;
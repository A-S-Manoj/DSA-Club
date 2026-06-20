import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
    createSessionSchema,
    updateSessionStatusSchema
} from '../validators/session.validator.js';

const router = Router();

router.post('/',
    protect,
    validate(createSessionSchema),
    sessionController.createSession
);

router.get('/',
    protect,
    sessionController.getSessions
);

router.get('/:sessionId',
    protect,
    sessionController.getSessionById
);

router.patch('/:sessionId/status',
    protect,
    validate(updateSessionStatusSchema),
    sessionController.updateSessionStatus
);

router.delete('/:sessionId',
    protect,
    sessionController.deleteSession
);

export default router;
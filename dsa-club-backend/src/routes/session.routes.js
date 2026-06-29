import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
    createSessionSchema,
    updateSessionStatusSchema
} from '../validators/session.validator.js';
import * as messageController from '../controllers/message.controller.js';
import { messageLimiter } from '../middleware/rateLimiter.middleware.js';
import { sendMessageSchema } from '../validators/message.validator.js';
import * as interviewController from '../controllers/interview.controller.js';
import { interviewMessageSchema } from '../validators/interview.validator.js';

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

router.post('/:sessionId/message',
    protect,
    messageLimiter,
    validate(sendMessageSchema),
    messageController.sendMessage
);

router.post('/:sessionId/interview',
    generalLimiter,
    protect,
    validate(interviewMessageSchema),
    interviewController.sendInterviewMessage
);

export default router;
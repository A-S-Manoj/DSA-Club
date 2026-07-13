import { Router } from 'express';
import * as problemController from '../controllers/problem.controller.js';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { importLimiter } from '../middleware/rateLimiter.middleware.js';
import { saveProblemSchema } from '../validators/problem.validator.js';

const router = Router();

router.post('/',
    protect,
    importLimiter,
    validate(saveProblemSchema),
    problemController.saveProblem
);

router.get('/:problemId',
    protect,
    problemController.getProblemById
);

export default router;
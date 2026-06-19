import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', protect, dashboardController.getStats);

export default router;
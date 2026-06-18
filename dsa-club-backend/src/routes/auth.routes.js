import { Router } from 'express';
import passport from 'passport';
import config from '../config/config.js';
import * as authController from '../controllers/auth.controller.js';
import protect from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register',
    authLimiter,
    validate(registerSchema),
    authController.register
);

router.post('/login',
    authLimiter,
    validate(loginSchema),
    authController.login
);

router.post('/logout',
    protect,
    authController.logout
);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${config.client.url}/login` }),
    authController.googleCallback
);

router.get('/profile',
    protect,
    authController.getProfile
);

router.put('/profile',
    protect,
    validate(updateProfileSchema),
    authController.updateProfile
);

router.post('/forgot-password',
    authLimiter,
    validate(forgotPasswordSchema),
    authController.forgotPassword
);

router.post('/reset-password',
    authLimiter,
    validate(resetPasswordSchema),
    authController.resetPassword
);

export default router;
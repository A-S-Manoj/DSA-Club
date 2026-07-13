import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/auth.service.js';
import config from '../config/config.js';

export const register = catchAsync(async (req, res) => {
    const user = await authService.register(res, req.body);
    res.status(201).json({ success: true, data: { user } });
});

export const login = catchAsync(async (req, res) => {
    const user = await authService.login(res, req.body);
    res.status(200).json({ success: true, data: { user } });
});

export const logout = catchAsync(async (req, res) => {
    authService.logout(res);
    res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
});

export const getProfile = catchAsync(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    res.status(200).json({ success: true, data: user });
});

export const updateProfile = catchAsync(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json({ success: true, data: user });
});

export const googleCallback = catchAsync(async (req, res) => {
    await authService.handleOAuthUser(res, {
        name: req.user.displayName,
        email: req.user.emails[0].value,
        authProviderId: req.user.id
    });
    res.redirect(`${config.client.url}/auth/success`);
});

export const forgotPassword = catchAsync(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
        success: true,
        data: { message: 'If that email exists, a reset link has been sent' }
    });
});

export const resetPassword = catchAsync(async (req, res) => {
    await authService.resetPassword(req.body);
    res.status(200).json({
        success: true,
        data: { message: 'Password reset successfully' }
    });
});
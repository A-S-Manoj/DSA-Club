import catchAsync from '../utils/catchAsync.js';
import * as sessionService from '../services/session.service.js';

export const createSession = catchAsync(async (req, res) => {
    const session = await sessionService.createSession(req.user._id, req.body);
    res.status(201).json({ success: true, data: session });
});

export const getSessions = catchAsync(async (req, res) => {
    const result = await sessionService.getSessions(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
});

export const getSessionById = catchAsync(async (req, res) => {
    const session = await sessionService.getSessionById(
        req.user._id,
        req.params.sessionId
    );
    res.status(200).json({ success: true, data: session });
});

export const updateSessionStatus = catchAsync(async (req, res) => {
    const session = await sessionService.updateSessionStatus(
        req.user._id,
        req.params.sessionId,
        req.body
    );
    res.status(200).json({ success: true, data: session });
});

export const deleteSession = catchAsync(async (req, res) => {
    await sessionService.deleteSession(req.user._id, req.params.sessionId);
    res.status(200).json({
        success: true,
        data: { message: 'Session deleted successfully' }
    });
});
import catchAsync from '../utils/catchAsync.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getStats = catchAsync(async (req, res) => {
    const stats = await dashboardService.getStats(req.user._id);
    res.status(200).json({ success: true, data: stats });
});
import catchAsync from '../utils/catchAsync.js';
import * as problemService from '../services/problem.service.js';

export const saveProblem = catchAsync(async (req, res) => {
    const problem = await problemService.saveProblem(req.body);
    res.status(201).json({ success: true, data: problem });
});

export const getProblemById = catchAsync(async (req, res) => {
    const problem = await problemService.getProblemById(req.params.problemId);
    res.status(200).json({ success: true, data: problem });
});
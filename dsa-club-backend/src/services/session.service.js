import User from '../models/User.model.js';
import Session from '../models/Session.model.js';
import Problem from '../models/Problem.model.js';
import AppError from '../utils/AppError.js';
import updateStreak from '../utils/streak.js';

export const createSession = async (userId, { problemId, mode }) => {
    // check problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found');
    }

    // check already solved
    const existingSolved = await Session.findOne({
        userId,
        problemId,
        status: 'solved'
    });

    if (existingSolved) {
        throw new AppError(409, 'SESSION_ALREADY_SOLVED', 'You have already solved this problem', {
            solvedAt: existingSolved.solvedAt,
            hintsUsed: existingSolved.hintsUsed,
            timeSpentSeconds: existingSolved.timeSpentSeconds
        });
    }

    const session = await Session.create({
        userId,
        problemId,
        mode,
        status: 'in_progress'
    });

    return session;
};

export const getSessions = async (userId, { status, topic, limit = 20, page = 1 }) => {
    const query = { userId };
    if (status) query.status = status;

    if (topic) {
        const matchingProblems = await Problem.find({ topic }).select('_id');
        query.problemId = { $in: matchingProblems.map(p => p._id) };
    }

    const sessions = await Session.find(query)
        .populate('problemId', 'title difficulty topic url source')
        .sort({ startedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(query);

    return {
        sessions,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
    };
};

export const getSessionById = async (userId, sessionId) => {
    const session = await Session.findById(sessionId)
        .populate('problemId');

    if (!session) {
        throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    if (session.userId.toString() !== userId.toString()) {
        throw new AppError(403, 'SESSION_FORBIDDEN', 'Access denied');
    }

    return session;
};

export const updateSessionStatus = async (userId, sessionId, { status }) => {
    const session = await Session.findById(sessionId);

    if (!session) {
        throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    if (session.userId.toString() !== userId.toString()) {
        throw new AppError(403, 'SESSION_FORBIDDEN', 'Access denied');
    }

    if (session.status !== 'in_progress') {
        throw new AppError(400, 'SESSION_ALREADY_COMPLETED', 'Session is already completed');
    }

    const now = new Date();
    const timeSpentSeconds = Math.floor(
        (now - new Date(session.startedAt)) / 1000
    );

    session.status = status;
    session.timeSpentSeconds = timeSpentSeconds;

    if (status === 'solved') {
        session.solvedAt = now;
        await session.save();
        await updateStreak(userId);
    } else {
        await session.save();
    }

    return session;
};

export const deleteSession = async (userId, sessionId) => {
    const session = await Session.findById(sessionId);

    if (!session) {
        throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    if (session.userId.toString() !== userId.toString()) {
        throw new AppError(403, 'SESSION_FORBIDDEN', 'Access denied');
    }

    if (session.status === 'solved') {
        await User.findByIdAndUpdate(userId, {
            $inc: { totalSolved: -1 }
        });
    }

    await session.deleteOne();
};
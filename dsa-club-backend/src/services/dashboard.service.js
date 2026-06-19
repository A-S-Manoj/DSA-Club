import Session from '../models/Session.model.js';
import User from '../models/User.model.js';

export const getStats = async (userId) => {
    const user = await User.findById(userId).select(
        'totalSolved currentStreak longestStreak'
    );

    const sessions = await Session.find({ userId })
        .populate('problemId', 'title difficulty topic')
        .sort({ startedAt: -1 });

    const solved = sessions.filter(s => s.status === 'solved');

    // total time
    const totalTimeSpentSeconds = solved.reduce(
        (acc, s) => acc + (s.timeSpentSeconds || 0), 0
    );

    // avg hints
    const avgHintsPerProblem = solved.length
        ? (solved.reduce((acc, s) => acc + s.hintsUsed, 0) / solved.length).toFixed(1)
        : 0;

    // topic breakdown
    const topicBreakdown = {};
    solved.forEach(s => {
        const topic = s.problemId?.topic || 'other';
        topicBreakdown[topic] = (topicBreakdown[topic] || 0) + 1;
    });

    // difficulty breakdown
    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    solved.forEach(s => {
        const diff = s.problemId?.difficulty;
        if (diff) difficultyBreakdown[diff]++;
    });

    // recent sessions
    const recentSessions = sessions.slice(0, 5);

    return {
        totalSolved: user.totalSolved,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalTimeSpentSeconds,
        avgHintsPerProblem,
        topicBreakdown,
        difficultyBreakdown,
        recentSessions
    };
};
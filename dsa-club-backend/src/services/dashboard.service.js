import mongoose from 'mongoose';
import Session from '../models/Session.model.js';
import User from '../models/User.model.js';

export const getStats = async (userId) => {
    const user = await User.findById(userId).select(
        'totalSolved currentStreak longestStreak'
    );

    if (!user) {
        return {
            totalSolved: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalTimeSpentSeconds: 0,
            avgHintsPerProblem: 0,
            topicBreakdown: {},
            difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
            recentSessions: []
        };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    const [statsResult, recentSessions] = await Promise.all([
        Session.aggregate([
            { $match: { userId: userObjectId, status: 'solved' } },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problemId',
                    foreignField: '_id',
                    as: 'problem'
                }
            },
            { $unwind: { path: '$problem', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: null,
                                totalTimeSpentSeconds: { $sum: { $ifNull: ['$timeSpentSeconds', 0] } },
                                totalHintsUsed: { $sum: { $ifNull: ['$hintsUsed', 0] } },
                                solvedCount: { $sum: 1 }
                            }
                        }
                    ],
                    topics: [
                        {
                            $group: {
                                _id: { $ifNull: ['$problem.topic', 'other'] },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    difficulties: [
                        {
                            $group: {
                                _id: '$problem.difficulty',
                                count: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ]),
        Session.find({ userId })
            .populate('problemId', 'title difficulty topic')
            .sort({ startedAt: -1 })
            .limit(5)
    ]);

    const stats = statsResult[0];
    const totals = stats?.totals?.[0] || { totalTimeSpentSeconds: 0, totalHintsUsed: 0, solvedCount: 0 };

    const topicBreakdown = {};
    if (stats?.topics) {
        stats.topics.forEach(t => {
            topicBreakdown[t._id] = t.count;
        });
    }

    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    if (stats?.difficulties) {
        stats.difficulties.forEach(d => {
            if (d._id && d._id in difficultyBreakdown) {
                difficultyBreakdown[d._id] = d.count;
            }
        });
    }

    const avgHintsPerProblem = totals.solvedCount
        ? (totals.totalHintsUsed / totals.solvedCount).toFixed(1)
        : 0;

    return {
        totalSolved: user.totalSolved,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalTimeSpentSeconds: totals.totalTimeSpentSeconds,
        avgHintsPerProblem,
        topicBreakdown,
        difficultyBreakdown,
        recentSessions
    };
};
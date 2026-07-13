import mongoose from 'mongoose';
import { differenceInCalendarDays } from 'date-fns';
import Session from '../models/Session.model.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

export const getStats = async (userId) => {
    const user = await User.findById(userId).select(
        'totalSolved currentStreak longestStreak lastActiveAt'
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

    // Check if streak is broken/expired (more than 1 calendar day since last active)
    let currentStreak = user.currentStreak;
    if (user.lastActiveAt) {
        const daysDiff = differenceInCalendarDays(new Date(), new Date(user.lastActiveAt));
        if (daysDiff > 1 && user.currentStreak > 0) {
            currentStreak = 0;
            // update in DB asynchronously to keep getStats fast
            User.findByIdAndUpdate(userId, { currentStreak: 0 }).catch(err => {
                logger.error({ message: 'Failed to reset expired streak in database', error: err.message, userId });
            });
        }
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
        currentStreak,
        longestStreak: user.longestStreak,
        totalTimeSpentSeconds: totals.totalTimeSpentSeconds,
        avgHintsPerProblem,
        topicBreakdown,
        difficultyBreakdown,
        recentSessions
    };
};
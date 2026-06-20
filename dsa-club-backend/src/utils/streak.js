import { differenceInCalendarDays, startOfDay } from 'date-fns';
import User from '../models/User.model.js';
import logger from './logger.js';

const updateStreak = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = startOfDay(now);

    if (!user.lastActiveAt) {
        await User.findByIdAndUpdate(userId, {
            $inc: { totalSolved: 1 },
            currentStreak: 1,
            longestStreak: Math.max(1, user.longestStreak),
            lastActiveAt: now
        });
        return;
    }

    const lastActive = startOfDay(new Date(user.lastActiveAt));
    const daysDiff = differenceInCalendarDays(today, lastActive);

    logger.debug({ message: 'Streak calculation', daysDiff, userId });

    if (daysDiff === 0) {
        await User.findByIdAndUpdate(userId, {
            $inc: { totalSolved: 1 }
        });
        return;
    }

    if (daysDiff === 1) {
        const newStreak = user.currentStreak + 1;
        await User.findByIdAndUpdate(userId, {
            $inc: { totalSolved: 1 },
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, user.longestStreak),
            lastActiveAt: now
        });
        return;
    }

    // daysDiff > 1 — streak broken
    await User.findByIdAndUpdate(userId, {
        $inc: { totalSolved: 1 },
        currentStreak: 1,
        lastActiveAt: now
    });
};

export default updateStreak;
import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.model.js';
import Problem from './src/models/Problem.model.js';
import Session from './src/models/Session.model.js';

dotenv.config();

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const user = await User.findOne({ email: 'chessplayer544@gmail.com' });
        if (!user) {
            console.error("User not found.");
            process.exit(1);
        }
        console.log(`Found User: ${user.name} (${user._id})`);

        const problem = await Problem.findOne({ title: { $regex: /^two sum$/i } });
        if (!problem) {
            console.error("Problem 'Two Sum' not found.");
            process.exit(1);
        }
        console.log(`Found Problem: ${problem.title} (${problem._id})`);

        // Find the existing session
        const session = await Session.findOne({ userId: user._id, problemId: problem._id });
        if (!session) {
            console.error("Session not found.");
            process.exit(1);
        }
        console.log(`Found Session: ${session._id}, current status: ${session.status}`);

        // Update the session to make it fresh and in_progress
        session.status = 'in_progress';
        session.conversation = [];
        session.hintsUsed = 0;
        session.timeSpentSeconds = 0;
        session.interviewFeedback = {};
        session.solvedAt = null;
        session.startedAt = new Date();

        await session.save();
        console.log("Session reset successfully.");

    } catch (err) {
        console.error("Error resetting session:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

run();

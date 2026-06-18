import mongoose from 'mongoose';

const conversationEntrySchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ['approach', 'hint', 'clarification', 'question', 'feedback'],
        required: true
    },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const interviewFeedbackSchema = new mongoose.Schema({
    clarityScore: { type: Number, min: 1, max: 10, default: null },
    technicalScore: { type: Number, min: 1, max: 10, default: null },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    summary: { type: String, default: null }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    status: {
        type: String,
        enum: ['in_progress', 'solved', 'abandoned'],
        default: 'in_progress'
    },
    mode: { type: String, enum: ['hint', 'interview'], required: true },
    hintsUsed: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    conversation: [conversationEntrySchema],
    interviewFeedback: { type: interviewFeedbackSchema, default: () => ({}) },
    startedAt: { type: Date, default: Date.now },
    solvedAt: { type: Date, default: null }
});

// indexes
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ userId: 1, problemId: 1 });
sessionSchema.index({ userId: 1, solvedAt: -1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
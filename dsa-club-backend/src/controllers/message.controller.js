import catchAsync from '../utils/catchAsync.js';
import * as sessionService from '../services/session.service.js';
import { generateHint } from '../services/hint.service.js';
import Session from '../models/Session.model.js';
import AppError from '../utils/AppError.js';

export const sendMessage = catchAsync(async (req, res) => {
    const { sessionId } = req.params;
    const { content, type } = req.body;

    // load session and verify ownership
    const session = await Session.findById(sessionId).populate('problemId');

    if (!session) {
        throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    if (session.userId.toString() !== req.user._id.toString()) {
        throw new AppError(403, 'SESSION_FORBIDDEN', 'Access denied');
    }

    if (session.status !== 'in_progress') {
        throw new AppError(400, 'SESSION_ALREADY_COMPLETED', 'Session is already completed');
    }

    // append user message to conversation
    const userMessage = {
        role: 'user',
        content,
        type,
        timestamp: new Date()
    };
    session.conversation.push(userMessage);

    // generate hint
    const { content: replyContent, classifiedIntent, isHint } = await generateHint({
        problem: session.problemId,
        conversation: session.conversation,
        hintsUsed: session.hintsUsed,
        latestMessage: content
    });

    // append AI reply
    const aiMessage = {
        role: 'assistant',
        content: replyContent,
        type: 'hint',
        timestamp: new Date()
    };
    session.conversation.push(aiMessage);

    // increment hints only for real hints
    if (isHint) {
        session.hintsUsed += 1;
    }

    await session.save();

    res.status(200).json({
        success: true,
        data: {
            reply: aiMessage,
            hintsUsed: session.hintsUsed,
            classifiedIntent
        }
    });
});
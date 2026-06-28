import catchAsync from '../utils/catchAsync.js';
import Session from '../models/Session.model.js';
import AppError from '../utils/AppError.js';
import { generateInterviewResponse } from '../services/interview.service.js';

export const sendInterviewMessage = catchAsync(async (req, res) => {
    const { sessionId } = req.params;
    const { explanation } = req.body;

    const session = await Session.findById(sessionId).populate('problemId');

    if (!session) {
        throw new AppError(404, 'SESSION_NOT_FOUND', 'Session not found');
    }

    if (session.userId.toString() !== req.user._id.toString()) {
        throw new AppError(403, 'SESSION_FORBIDDEN', 'Access denied');
    }

    // interview mode works on solved sessions
    if (session.status !== 'solved') {
        throw new AppError(400, 'SESSION_ALREADY_COMPLETED', 'Session must be solved before interview mode');
    }

    // append user explanation to conversation
    const userMessage = {
        role: 'user',
        content: explanation,
        type: 'question',
        timestamp: new Date()
    };
    session.conversation.push(userMessage);

    // generate interview response
    const {
        reply,
        interviewComplete,
        questionsAsked,
        feedback
    } = await generateInterviewResponse({
        problem: session.problemId,
        conversation: session.conversation,
        latestMessage: explanation
    });

    // append AI response
    const aiMessage = {
        role: 'assistant',
        content: reply,
        type: interviewComplete ? 'feedback' : 'question',
        timestamp: new Date()
    };
    session.conversation.push(aiMessage);

    // save feedback if interview complete
    if (interviewComplete && feedback) {
        session.interviewFeedback = {
            clarityScore: feedback.clarityScore,
            technicalScore: feedback.technicalScore,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            summary: feedback.summary
        };
    }

    await session.save();

    res.status(200).json({
        success: true,
        data: {
            reply: aiMessage,
            interviewComplete,
            questionsAsked,
            ...(interviewComplete && { interviewFeedback: session.interviewFeedback })
        }
    });
});
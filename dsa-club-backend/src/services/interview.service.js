import { generateContent, generateJSON } from './gemini.service.js';
import interviewPrompt from '../prompts/interview.prompt.js';
import feedbackPrompt from '../prompts/feedback.prompt.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

const INTERVIEW_CATEGORIES = [
    'COMPLEXITY',
    'EDGE_CASES',
    'OPTIMISATION',
    'ALTERNATIVES',
    'TRACE_THROUGH'
];

const feedbackSchema = {
    type: "OBJECT",
    properties: {
        clarityScore: { 
            type: "INTEGER", 
            description: "Clarity score from 1 to 10" 
        },
        technicalScore: { 
            type: "INTEGER", 
            description: "Technical accuracy score from 1 to 10" 
        },
        strengths: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of specific strengths observed in the transcript"
        },
        improvements: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of specific improvements/actionable suggestions"
        },
        summary: { 
            type: "STRING", 
            description: "A 2-3 sentence overall assessment of the candidate" 
        }
    },
    required: ["clarityScore", "technicalScore", "strengths", "improvements", "summary"]
};

const parseFeedback = (raw) => {
    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        const cleaned = raw
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(cleaned);
    } catch (err) {
        logger.error({ message: 'Failed to parse feedback JSON', raw, error: err.message });
        throw new AppError(500, 'AI_INVALID_RESPONSE', 'Failed to parse feedback response');
    }
};

export const generateInterviewResponse = async ({ problem, conversation, latestMessage }) => {
    // count questions asked so far by assistant
    const assistantMessages = conversation.filter(m => m.role === 'assistant' && m.type !== 'hint');
    const questionsAsked = Math.max(0, assistantMessages.length - 0);

    // track which categories have been covered
    const categoriesCovered = assistantMessages
        .filter(m => m.interviewCategory)
        .map(m => m.interviewCategory);

    // determine next category
    const remainingCategories = INTERVIEW_CATEGORIES.filter(
        c => !categoriesCovered.includes(c)
    );

    // check if interview is complete
    const isComplete = questionsAsked >= 4;

    if (isComplete) {
        // generate feedback
        const transcript = conversation
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        const raw = await generateJSON(feedbackPrompt({ problem, transcript }), feedbackSchema);
        const feedback = parseFeedback(raw);

        return {
            reply: "Thank you. That concludes our session.",
            interviewComplete: true,
            questionsAsked,
            feedback
        };
    }

    // build and send interview prompt
    const prompt = interviewPrompt({
        problem,
        conversation,
        questionsAsked,
        categoriesCovered,
        latestMessage
    });

    const reply = await generateContent(prompt);

    return {
        reply,
        interviewComplete: false,
        questionsAsked: questionsAsked + 1,
        nextCategory: remainingCategories[0] || null,
        feedback: null
    };
};
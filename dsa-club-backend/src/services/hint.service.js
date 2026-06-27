import { generateContent } from './gemini.service.js';
import guardPrompt from '../prompts/guard.prompt.js';
import hintPrompt from '../prompts/hint.prompt.js';
import logger from '../utils/logger.js';

const CANNED_RESPONSES = {
    PASTED_SOLUTION: "I can see you have found a solution. But working through it yourself is what builds interview skills. Set that aside and tell me — what was your own initial instinct when you read the problem?",
    OFF_TOPIC: "I am here specifically to help you with this DSA problem. Let us stay focused — where are you currently stuck?",
    TOXIC: "I am here to help you learn. Let us keep things focused on the problem."
};

const VALID_CATEGORIES = [
    'VALID_APPROACH',
    'HINT_REQUEST',
    'ANSWER_REQUEST',
    'PASTED_SOLUTION',
    'OFF_TOPIC',
    'TOXIC'
];

export const classifyMessage = async (message) => {
    const prompt = guardPrompt(message);
    const raw = await generateContent(prompt);
    const category = raw.trim().toUpperCase();
    logger.debug({ message: 'Guard classification', category });
    return VALID_CATEGORIES.includes(category) ? category : 'VALID_APPROACH';
};

// truncate conversation if too long
const truncateConversation = (conversation) => {
    if (conversation.length <= 10) return conversation;

    const first2 = conversation.slice(0, 2);
    const last6 = conversation.slice(-6);
    const middleCount = conversation.length - 8;

    const summaryEntry = {
        role: 'assistant',
        content: `[Earlier in session: student explored initial approaches and received ${middleCount} exchanges of guidance]`,
        type: 'hint',
        timestamp: new Date()
    };

    return [...first2, summaryEntry, ...last6];
};

export const generateHint = async ({ problem, conversation, hintsUsed, latestMessage }) => {
    // step 1 — classify message
    const classifiedIntent = await classifyMessage(latestMessage);

    // step 2 — handle canned responses immediately
    if (CANNED_RESPONSES[classifiedIntent]) {
        return {
            content: CANNED_RESPONSES[classifiedIntent],
            classifiedIntent,
            isHint: false
        };
    }

    // step 3 — truncate conversation if needed
    const truncatedConversation = truncateConversation(conversation);

    // step 4 — build and send hint prompt
    const prompt = hintPrompt({
        problem,
        conversation: truncatedConversation,
        hintsUsed,
        classifiedIntent,
        latestMessage
    });

    const content = await generateContent(prompt);

    return {
        content,
        classifiedIntent,
        isHint: true
    };
};
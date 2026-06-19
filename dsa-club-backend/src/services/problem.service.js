import Problem from '../models/Problem.model.js';
import AppError from '../utils/AppError.js';
import { generateContent } from './gemini.service.js';
import topicInferencePrompt from '../prompts/topicInference.prompt.js';

const VALID_TOPICS = [
    'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
    'dynamic-programming', 'backtracking', 'binary-search',
    'stack-queue', 'heap', 'greedy', 'other'
];

export const inferTopic = async (description) => {
    const prompt = topicInferencePrompt(description);
    const raw = await generateContent(prompt);
    const topic = raw.toLowerCase().trim();
    return VALID_TOPICS.includes(topic) ? topic : 'other';
};

export const saveProblem = async (problemData) => {
    const topic = await inferTopic(problemData.description);
    const problem = await Problem.create({ ...problemData, topic });
    return problem;
};

export const getProblemById = async (problemId) => {
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Problem not found');
    }
    return problem;
};
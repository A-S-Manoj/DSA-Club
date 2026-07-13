import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/config.js';
import retryWithBackoff from '../utils/retry.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

const genAI = config.gemini.apiKey ? new GoogleGenerativeAI(config.gemini.apiKey) : null;

const getModel = () => {
  if (!genAI) {
    throw new AppError(500, 'AI_SERVICE_UNAVAILABLE', 'Gemini API key is not configured');
  }
  return genAI.getGenerativeModel({ model: config.gemini.model });
};

export const generateContent = async (prompt) => {
  return retryWithBackoff(async () => {
    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });
    const text = result.response.text().trim();
    logger.debug({ message: 'Gemini response', text });
    return text;
  });
};

export const generateJSON = async (prompt, schema) => {
  return retryWithBackoff(async () => {
    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });
    const text = result.response.text().trim();
    logger.debug({ message: 'Gemini JSON response', text });
    return text;
  });
};
import { z } from 'zod';

export const interviewMessageSchema = z.object({
    explanation: z.string().min(1, 'Explanation cannot be empty').max(5000)
});
import { z } from 'zod';

export const createSessionSchema = z.object({
    problemId: z.string().min(1, 'Problem ID is required'),
    mode: z.enum(['hint', 'interview'])
});

export const updateSessionStatusSchema = z.object({
    status: z.enum(['solved', 'abandoned'])
});
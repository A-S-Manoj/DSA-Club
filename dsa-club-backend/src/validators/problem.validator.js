import { z } from 'zod';

export const saveProblemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    source: z.enum(['leetcode', 'gfg', 'manual']),
    url: z.string().url().optional().nullable()
});
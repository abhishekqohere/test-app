import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  taskId: z.string().min(1),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const commentIdParamSchema = z.object({
  commentId: z.string().min(1),
});

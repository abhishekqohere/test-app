import { z } from 'zod';

const taskStatus = z.enum(['Todo', 'In Progress', 'Review', 'Done']);
const taskPriority = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(10000).optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  labels: z.array(z.string().max(50)).optional(),
  dueDate: z.string().datetime().optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(10000).optional(),
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  labels: z.array(z.string().max(50)).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().min(1).nullable().optional(),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().min(1),
});

export const changeStatusSchema = z.object({
  status: taskStatus,
});

export const taskFilterSchema = z.object({
  status: taskStatus.optional(),
  priority: taskPriority.optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().min(1),
});

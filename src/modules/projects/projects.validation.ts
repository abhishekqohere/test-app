import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['Planning', 'Active', 'On Hold', 'Completed', 'Archived']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const assignMembersSchema = z.object({
  memberIds: z.array(z.string().min(1)),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1),
});

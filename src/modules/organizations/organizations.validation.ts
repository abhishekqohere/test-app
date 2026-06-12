import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['Owner', 'Admin', 'Manager', 'Member']).default('Member'),
});

export const organizationIdParamSchema = z.object({
  organizationId: z.string().min(1),
});

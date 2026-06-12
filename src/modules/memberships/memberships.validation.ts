import { z } from 'zod';

const roleEnum = z.enum(['Owner', 'Admin', 'Manager', 'Member']);

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: roleEnum.default('Member'),
});

export const changeRoleSchema = z.object({
  role: roleEnum,
});

export const membershipIdParamSchema = z.object({
  membershipId: z.string().min(1),
});

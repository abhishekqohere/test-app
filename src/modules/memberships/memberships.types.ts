import type { Role } from '../../utils/types';

export interface MembershipDTO {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AddMemberInput {
  userId: string;
  role: Role;
}

export interface ChangeRoleInput {
  role: Role;
}

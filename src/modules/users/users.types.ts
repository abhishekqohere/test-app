import type { Role } from '../../utils/types';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  globalRole?: Role;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

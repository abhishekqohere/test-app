import type { ROLES, TASK_STATUSES, TASK_PRIORITIES, PROJECT_STATUSES, ENTITY_TYPES } from '../config/constants';

export type Role = (typeof ROLES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type EntityType = (typeof ENTITY_TYPES)[number];

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

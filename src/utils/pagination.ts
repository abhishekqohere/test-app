import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';
import type { PaginationMeta, PaginatedResult } from './types';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const parsePagination = (options: PaginationOptions = {}): { page: number; limit: number; skip: number } => {
  const page = Math.max(DEFAULT_PAGE, options.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, options.limit ?? DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});

export const paginate = <T>(items: T[], total: number, page: number, limit: number): PaginatedResult<T> => ({
  items,
  meta: buildPaginationMeta(total, page, limit),
});

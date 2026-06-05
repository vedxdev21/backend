import { PAGINATION } from '../config/constants';
import { PaginationMeta, PaginationQuery } from '../types/common.types';

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const parseSortOrder = (
  sort?: string,
  order?: string,
  allowedFields: string[] = ['createdAt']
): { orderBy: Record<string, 'asc' | 'desc'> } => {
  const sortField = sort && allowedFields.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  return { orderBy: { [sortField]: sortOrder } };
};

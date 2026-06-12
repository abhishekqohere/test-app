import { parsePagination, buildPaginationMeta, paginate } from '../../utils/pagination';

describe('pagination utils', () => {
  it('parses default pagination', () => {
    const result = parsePagination({});
    expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('caps limit at MAX_LIMIT', () => {
    const result = parsePagination({ limit: 500 });
    expect(result.limit).toBe(100);
  });

  it('builds meta correctly', () => {
    const meta = buildPaginationMeta(45, 2, 20);
    expect(meta).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
  });

  it('paginates items with meta', () => {
    const result = paginate(['a', 'b'], 10, 1, 2);
    expect(result.items).toHaveLength(2);
    expect(result.meta.totalPages).toBe(5);
  });
});

import { Activity, type IActivity } from './activities.model';
import type { LogActivityInput } from './activities.types';
import type { PaginatedResult } from '../../utils/types';
import { parsePagination, paginate } from '../../utils/pagination';

export class ActivityRepository {
  async create(input: LogActivityInput): Promise<IActivity> {
    const [doc] = await Activity.create([input]);
    return doc;
  }

  async findByOrganization(
    organizationId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<IActivity>> {
    const { page: p, limit: l, skip } = parsePagination({ page, limit });
    const filter = { organizationId };
    const [items, total] = await Promise.all([
      Activity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Activity.countDocuments(filter),
    ]);
    return paginate(items, total, p, l);
  }

  async findByEntity(
    entityType: IActivity['entityType'],
    entityId: string,
    page = 1,
    limit = 20,
  ) {
    const { page: p, limit: l, skip } = parsePagination({ page, limit });
    const filter = { entityType, entityId };
    const [items, total] = await Promise.all([
      Activity.find(filter as never).sort({ createdAt: -1 }).skip(skip).limit(l),
      Activity.countDocuments(filter as never),
    ]);
    return paginate(items, total, p, l);
  }
}

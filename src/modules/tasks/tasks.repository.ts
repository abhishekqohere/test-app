import { BaseRepository } from '../../utils/baseRepository';
import { Task, type ITask } from './tasks.model';
import type { TaskFilterQuery } from './tasks.types';
import type { PaginatedResult } from '../../utils/types';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  buildFilter(organizationId: string, query: TaskFilterQuery): Record<string, unknown> {
    const filter: Record<string, unknown> = { organizationId };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assigneeId) filter.assigneeId = query.assigneeId;
    if (query.projectId) filter.projectId = query.projectId;

    if (query.startDate || query.endDate) {
      filter.dueDate = {};
      if (query.startDate) (filter.dueDate as Record<string, Date>).$gte = new Date(query.startDate);
      if (query.endDate) (filter.dueDate as Record<string, Date>).$lte = new Date(query.endDate);
    }

    return filter;
  }

  async findFiltered(
    organizationId: string,
    query: TaskFilterQuery,
  ): Promise<PaginatedResult<ITask>> {
    const filter = this.buildFilter(organizationId, query);
    return this.paginate(filter, { page: query.page, limit: query.limit });
  }
}

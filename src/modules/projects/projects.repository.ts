import { BaseRepository } from '../../utils/baseRepository';
import { Project, type IProject } from './projects.model';

export class ProjectRepository extends BaseRepository<IProject> {
  constructor() {
    super(Project);
  }

  async findByOrganization(
    organizationId: string,
    includeArchived = false,
  ): Promise<IProject[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (!includeArchived) filter.archivedAt = null;
    return this.findMany(filter as Parameters<typeof this.findMany>[0]);
  }

  async archive(id: string): Promise<IProject | null> {
    return this.updateById(id, {
      archivedAt: new Date(),
      status: 'Archived',
    });
  }

  async restore(id: string): Promise<IProject | null> {
    return this.updateById(id, {
      archivedAt: null,
      status: 'Active',
    });
  }
}

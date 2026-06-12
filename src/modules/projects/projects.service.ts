import { ACTIVITY_ACTIONS } from '../../config/constants';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { canManageProjects } from '../../utils/permissions';
import type { Role } from '../../utils/types';
import { Task } from '../tasks/tasks.model';
import { ProjectRepository } from './projects.repository';
import type { IProject } from './projects.model';
import type {
  ProjectDTO,
  CreateProjectInput,
  UpdateProjectInput,
  AssignMembersInput,
  ProjectStatistics,
} from './projects.types';
import type { ActivityService } from '../activities/activities.service';

export class ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly activityService?: ActivityService,
  ) {}

  toDTO(project: IProject): ProjectDTO {
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      organizationId: project.organizationId.toString(),
      memberIds: project.memberIds.map((id) => id.toString()),
      createdBy: project.createdBy.toString(),
      archivedAt: project.archivedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private async getOrgProject(projectId: string, organizationId: string): Promise<IProject> {
    const project = await this.projectRepo.findById(projectId);
    if (!project || project.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Project not found');
    }
    return project;
  }

  async create(
    organizationId: string,
    userId: string,
    role: Role,
    input: CreateProjectInput,
  ): Promise<ProjectDTO> {
    if (!canManageProjects(role)) throw new ForbiddenError();

    const project = await this.projectRepo.create({
      name: input.name,
      description: input.description,
      status: input.status ?? 'Planning',
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      organizationId,
      memberIds: [userId],
      createdBy: userId,
    } as Record<string, unknown>);

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.PROJECT_CREATED,
      entityType: 'Project',
      entityId: project._id.toString(),
      organizationId,
    });

    return this.toDTO(project);
  }

  async list(organizationId: string, includeArchived = false): Promise<ProjectDTO[]> {
    const projects = await this.projectRepo.findByOrganization(organizationId, includeArchived);
    return projects.map((p) => this.toDTO(p));
  }

  async getById(organizationId: string, projectId: string): Promise<ProjectDTO> {
    const project = await this.getOrgProject(projectId, organizationId);
    return this.toDTO(project);
  }

  async update(
    organizationId: string,
    projectId: string,
    userId: string,
    role: Role,
    input: UpdateProjectInput,
  ): Promise<ProjectDTO> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgProject(projectId, organizationId);

    const { startDate, endDate, ...rest } = input;
    const update: Record<string, unknown> = { ...rest };
    if (startDate) update.startDate = new Date(startDate);
    if (endDate) update.endDate = new Date(endDate);

    const project = await this.projectRepo.updateById(projectId, update);
    if (!project) throw new NotFoundError('Project not found');

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.PROJECT_UPDATED,
      entityType: 'Project',
      entityId: projectId,
      organizationId,
    });

    return this.toDTO(project);
  }

  async delete(organizationId: string, projectId: string, userId: string, role: Role): Promise<void> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgProject(projectId, organizationId);
    await this.projectRepo.softDelete(projectId);
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.PROJECT_DELETED,
      entityType: 'Project',
      entityId: projectId,
      organizationId,
    });
  }

  async archive(organizationId: string, projectId: string, userId: string, role: Role): Promise<ProjectDTO> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgProject(projectId, organizationId);
    const project = await this.projectRepo.archive(projectId);
    if (!project) throw new NotFoundError('Project not found');
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.PROJECT_ARCHIVED,
      entityType: 'Project',
      entityId: projectId,
      organizationId,
    });
    return this.toDTO(project);
  }

  async restore(organizationId: string, projectId: string, userId: string, role: Role): Promise<ProjectDTO> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgProject(projectId, organizationId);
    const project = await this.projectRepo.restore(projectId);
    if (!project) throw new NotFoundError('Project not found');
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.PROJECT_RESTORED,
      entityType: 'Project',
      entityId: projectId,
      organizationId,
    });
    return this.toDTO(project);
  }

  async assignMembers(
    organizationId: string,
    projectId: string,
    role: Role,
    input: AssignMembersInput,
  ): Promise<ProjectDTO> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgProject(projectId, organizationId);
    const project = await this.projectRepo.updateById(projectId, { memberIds: input.memberIds });
    if (!project) throw new NotFoundError('Project not found');
    return this.toDTO(project);
  }

  async getStatistics(organizationId: string, projectId: string): Promise<ProjectStatistics> {
    await this.getOrgProject(projectId, organizationId);
    const baseFilter = {
      projectId,
      organizationId,
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    };

    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.countDocuments({ ...baseFilter, status: 'Done' }),
      Task.countDocuments({ ...baseFilter, status: 'In Progress' }),
      Task.countDocuments({
        ...baseFilter,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }
}

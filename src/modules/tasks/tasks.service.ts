import { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } from '../../config/constants';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { canManageProjects } from '../../utils/permissions';
import type { Role } from '../../utils/types';
import { ProjectRepository } from '../projects/projects.repository';
import { TaskRepository } from './tasks.repository';
import type { ITask } from './tasks.model';
import type {
  TaskDTO,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterQuery,
} from './tasks.types';
import type { ActivityService } from '../activities/activities.service';
import type { NotificationService } from '../notifications/notifications.service';

export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly projectRepo: ProjectRepository,
    private readonly activityService?: ActivityService,
    private readonly notificationService?: NotificationService,
  ) {}

  toDTO(task: ITask): TaskDTO {
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      labels: task.labels,
      dueDate: task.dueDate,
      projectId: task.projectId.toString(),
      organizationId: task.organizationId.toString(),
      assigneeId: task.assigneeId?.toString() ?? null,
      createdBy: task.createdBy.toString(),
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private async validateProject(organizationId: string, projectId: string): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project || project.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Project not found');
    }
  }

  private async getOrgTask(taskId: string, organizationId: string): Promise<ITask> {
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Task not found');
    }
    return task;
  }

  async create(
    organizationId: string,
    userId: string,
    role: Role,
    input: CreateTaskInput,
  ): Promise<TaskDTO> {
    if (!canManageProjects(role) && role === 'Member') {
      // Members can create tasks if assigned to project - allow all members for now
    }
    await this.validateProject(organizationId, input.projectId);

    const task = await this.taskRepo.create({
      title: input.title,
      description: input.description,
      status: input.status ?? 'Todo',
      priority: input.priority ?? 'Medium',
      labels: input.labels ?? [],
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      projectId: input.projectId,
      organizationId,
      assigneeId: input.assigneeId ?? null,
      createdBy: userId,
    } as Record<string, unknown>);

    if (input.assigneeId) {
      await this.notifyAssignment(input.assigneeId, organizationId, task);
    }

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.TASK_CREATED,
      entityType: 'Task',
      entityId: task._id.toString(),
      organizationId,
    });

    return this.toDTO(task);
  }

  async list(organizationId: string, filters: TaskFilterQuery) {
    const result = await this.taskRepo.findFiltered(organizationId, filters);
    return {
      items: result.items.map((t) => this.toDTO(t)),
      meta: result.meta,
    };
  }

  async getById(organizationId: string, taskId: string): Promise<TaskDTO> {
    const task = await this.getOrgTask(taskId, organizationId);
    return this.toDTO(task);
  }

  async update(
    organizationId: string,
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<TaskDTO> {
    await this.getOrgTask(taskId, organizationId);

    const { dueDate, ...rest } = input;
    const update: Record<string, unknown> = { ...rest };
    if (dueDate !== undefined) {
      update.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (input.status === 'Done') update.completedAt = new Date();
    if (input.status && input.status !== 'Done') update.completedAt = null;

    const task = await this.taskRepo.updateById(taskId, update);
    if (!task) throw new NotFoundError('Task not found');

    if (input.status === 'Done') {
      await this.onTaskCompleted(task, userId, organizationId);
    }

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.TASK_UPDATED,
      entityType: 'Task',
      entityId: taskId,
      organizationId,
    });

    return this.toDTO(task);
  }

  async delete(organizationId: string, taskId: string, userId: string, role: Role): Promise<void> {
    if (!canManageProjects(role)) throw new ForbiddenError();
    await this.getOrgTask(taskId, organizationId);
    await this.taskRepo.softDelete(taskId);
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.TASK_DELETED,
      entityType: 'Task',
      entityId: taskId,
      organizationId,
    });
  }

  async assign(
    organizationId: string,
    taskId: string,
    userId: string,
    assigneeId: string,
  ): Promise<TaskDTO> {
    await this.getOrgTask(taskId, organizationId);
    const updated = await this.taskRepo.updateById(taskId, { assigneeId });
    if (!updated) throw new NotFoundError('Task not found');

    await this.notifyAssignment(assigneeId, organizationId, updated);
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.TASK_ASSIGNED,
      entityType: 'Task',
      entityId: taskId,
      organizationId,
      metadata: { assigneeId },
    });

    return this.toDTO(updated);
  }

  async changeStatus(
    organizationId: string,
    taskId: string,
    userId: string,
    status: ITask['status'],
  ): Promise<TaskDTO> {
    return this.update(organizationId, taskId, userId, { status });
  }

  private async notifyAssignment(
    assigneeId: string,
    organizationId: string,
    task: ITask,
  ): Promise<void> {
    await this.notificationService?.create({
      userId: assigneeId,
      organizationId,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: 'Task assigned',
      message: `You were assigned: ${task.title}`,
      entityType: 'Task',
      entityId: task._id.toString(),
    });
  }

  private async onTaskCompleted(task: ITask, userId: string, organizationId: string): Promise<void> {
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.TASK_COMPLETED,
      entityType: 'Task',
      entityId: task._id.toString(),
      organizationId,
    });

    if (task.assigneeId) {
      await this.notificationService?.create({
        userId: task.assigneeId.toString(),
        organizationId,
        type: NOTIFICATION_TYPES.TASK_COMPLETED,
        title: 'Task completed',
        message: `Task completed: ${task.title}`,
        entityType: 'Task',
        entityId: task._id.toString(),
      });
    }
  }
}

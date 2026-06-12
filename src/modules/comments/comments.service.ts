import { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } from '../../config/constants';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { TaskRepository } from '../tasks/tasks.repository';
import { CommentRepository } from './comments.repository';
import type { IComment } from './comments.model';
import type { CommentDTO, CreateCommentInput, UpdateCommentInput } from './comments.types';
import type { ActivityService } from '../activities/activities.service';
import type { NotificationService } from '../notifications/notifications.service';

export class CommentService {
  constructor(
    private readonly commentRepo: CommentRepository,
    private readonly taskRepo: TaskRepository,
    private readonly activityService?: ActivityService,
    private readonly notificationService?: NotificationService,
  ) {}

  toDTO(comment: IComment): CommentDTO {
    return {
      id: comment._id.toString(),
      content: comment.content,
      taskId: comment.taskId.toString(),
      organizationId: comment.organizationId.toString(),
      authorId: comment.authorId.toString(),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async create(
    organizationId: string,
    userId: string,
    input: CreateCommentInput,
  ): Promise<CommentDTO> {
    const task = await this.taskRepo.findById(input.taskId);
    if (!task || task.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Task not found');
    }

    const comment = await this.commentRepo.create({
      content: input.content,
      taskId: input.taskId,
      organizationId,
      authorId: userId,
    } as Record<string, unknown>);

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.COMMENT_ADDED,
      entityType: 'Comment',
      entityId: comment._id.toString(),
      organizationId,
      metadata: { taskId: input.taskId },
    });

    if (task.assigneeId && task.assigneeId.toString() !== userId) {
      await this.notificationService?.create({
        userId: task.assigneeId.toString(),
        organizationId,
        type: NOTIFICATION_TYPES.COMMENT_ADDED,
        title: 'New comment',
        message: `New comment on task: ${task.title}`,
        entityType: 'Task',
        entityId: task._id.toString(),
      });
    }

    return this.toDTO(comment);
  }

  async listByTask(organizationId: string, taskId: string): Promise<CommentDTO[]> {
    const task = await this.taskRepo.findById(taskId);
    if (!task || task.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Task not found');
    }
    const comments = await this.commentRepo.findByTask(taskId);
    return comments.map((c) => this.toDTO(c));
  }

  async update(
    organizationId: string,
    commentId: string,
    userId: string,
    input: UpdateCommentInput,
  ): Promise<CommentDTO> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment || comment.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Comment not found');
    }
    if (comment.authorId.toString() !== userId) {
      throw new ForbiddenError('Only the author can edit this comment');
    }

    const updated = await this.commentRepo.updateById(commentId, { content: input.content });
    if (!updated) throw new NotFoundError('Comment not found');

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.COMMENT_EDITED,
      entityType: 'Comment',
      entityId: commentId,
      organizationId,
    });

    return this.toDTO(updated);
  }

  async delete(organizationId: string, commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment || comment.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Comment not found');
    }
    if (comment.authorId.toString() !== userId) {
      throw new ForbiddenError('Only the author can delete this comment');
    }

    await this.commentRepo.softDelete(commentId);

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.COMMENT_DELETED,
      entityType: 'Comment',
      entityId: commentId,
      organizationId,
    });
  }
}

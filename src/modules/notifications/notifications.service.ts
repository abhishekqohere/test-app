import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { NotificationRepository } from './notifications.repository';
import type { INotification } from './notifications.model';
import type { NotificationDTO, CreateNotificationInput } from './notifications.types';

export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  toDTO(n: INotification): NotificationDTO {
    return {
      id: n._id.toString(),
      userId: n.userId.toString(),
      organizationId: n.organizationId.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      entityType: n.entityType,
      entityId: n.entityId,
      read: n.read,
      readAt: n.readAt,
      createdAt: n.createdAt,
    };
  }

  async create(input: CreateNotificationInput): Promise<NotificationDTO> {
    const notification = await this.notificationRepo.create(input);
    return this.toDTO(notification);
  }

  async list(userId: string, organizationId: string, page?: number, limit?: number) {
    const result = await this.notificationRepo.findByUser(userId, organizationId, page, limit);
    return {
      items: result.items.map((n) => this.toDTO(n)),
      meta: result.meta,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationDTO> {
    const notification = await this.notificationRepo.markAsRead(notificationId, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return this.toDTO(notification);
  }

  async markAllAsRead(userId: string, organizationId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.markAllAsRead(userId, organizationId);
    return { count };
  }

  async getUnreadCount(userId: string, organizationId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.countUnread(userId, organizationId);
    return { count };
  }
}

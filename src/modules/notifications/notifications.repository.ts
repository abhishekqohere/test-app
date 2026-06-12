import { Notification, type INotification } from './notifications.model';
import type { CreateNotificationInput } from './notifications.types';
import type { PaginatedResult } from '../../utils/types';
import { parsePagination, paginate } from '../../utils/pagination';

export class NotificationRepository {
  async create(input: CreateNotificationInput): Promise<INotification> {
    const [doc] = await Notification.create([input]);
    return doc;
  }

  async findByUser(
    userId: string,
    organizationId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<INotification>> {
    const { page: p, limit: l, skip } = parsePagination({ page, limit });
    const filter = { userId, organizationId };
    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Notification.countDocuments(filter),
    ]);
    return paginate(items, total, p, l);
  }

  async findById(id: string): Promise<INotification | null> {
    return Notification.findById(id);
  }

  async markAsRead(id: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId: string, organizationId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, organizationId, read: false },
      { read: true, readAt: new Date() },
    );
    return result.modifiedCount;
  }

  async countUnread(userId: string, organizationId: string): Promise<number> {
    return Notification.countDocuments({ userId, organizationId, read: false });
  }
}

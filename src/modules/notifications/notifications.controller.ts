import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { NotificationService } from './notifications.service';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await this.notificationService.list(
      req.user!.id,
      req.organizationId!,
      page,
      limit,
    );
    sendSuccess(res, result);
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await this.notificationService.markAsRead(
      param(req.params.notificationId),
      req.user!.id,
    );
    sendSuccess(res, notification);
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.notificationService.markAllAsRead(
      req.user!.id,
      req.organizationId!,
    );
    sendSuccess(res, result);
  });

  unreadCount = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.notificationService.getUnreadCount(
      req.user!.id,
      req.organizationId!,
    );
    sendSuccess(res, result);
  });
}

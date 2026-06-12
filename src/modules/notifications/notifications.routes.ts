import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization } from '../../middleware/organization';
import type { NotificationController } from './notifications.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createNotificationRoutes = (
  controller: NotificationController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  router.use(authenticate, requireOrganization(membershipService));

  router.get('/', controller.list);
  router.get('/unread-count', controller.unreadCount);
  router.patch('/read-all', controller.markAllAsRead);
  router.patch('/:notificationId/read', controller.markAsRead);

  return router;
};

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization } from '../../middleware/organization';
import type { ActivityController } from './activities.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createActivityRoutes = (
  controller: ActivityController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  router.use(authenticate, requireOrganization(membershipService));

  router.get('/', controller.listByOrganization);
  router.get('/entity/:entityType/:entityId', controller.listByEntity);

  return router;
};

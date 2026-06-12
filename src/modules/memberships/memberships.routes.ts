import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization, requireRole } from '../../middleware/organization';
import { validate } from '../../middleware/validate';
import { addMemberSchema, changeRoleSchema } from './memberships.validation';
import type { MembershipController } from './memberships.controller';
import type { MembershipService } from './memberships.service';

export const createMembershipRoutes = (
  controller: MembershipController,
  membershipService: MembershipService,
): Router => {
  const router = Router({ mergeParams: true });
  const orgMiddleware = requireOrganization(membershipService);

  router.use(authenticate, orgMiddleware);

  router.get('/', controller.list);
  router.post('/', requireRole('Admin'), validate(addMemberSchema), controller.add);
  router.delete('/:membershipId', requireRole('Admin'), controller.remove);
  router.patch('/:membershipId/role', requireRole('Admin'), validate(changeRoleSchema), controller.changeRole);

  return router;
};

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization, requireRole } from '../../middleware/organization';
import { validate } from '../../middleware/validate';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
} from './organizations.validation';
import type { OrganizationController } from './organizations.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createOrganizationRoutes = (
  controller: OrganizationController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  const orgMiddleware = requireOrganization(membershipService);

  router.post('/', authenticate, validate(createOrganizationSchema), controller.create);
  router.get('/', authenticate, controller.list);
  router.get('/:organizationId', authenticate, orgMiddleware, controller.getById);
  router.patch('/:organizationId', authenticate, orgMiddleware, requireRole('Admin'), validate(updateOrganizationSchema), controller.update);
  router.delete('/:organizationId', authenticate, orgMiddleware, requireRole('Owner'), controller.delete);
  router.post('/:organizationId/invite', authenticate, orgMiddleware, requireRole('Admin'), validate(inviteMemberSchema), controller.invite);
  router.delete('/:organizationId/members/:membershipId', authenticate, orgMiddleware, requireRole('Admin'), controller.removeMember);

  return router;
};

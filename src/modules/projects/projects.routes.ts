import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization, requireRole } from '../../middleware/organization';
import { validate } from '../../middleware/validate';
import { createProjectSchema, updateProjectSchema, assignMembersSchema } from './projects.validation';
import type { ProjectController } from './projects.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createProjectRoutes = (
  controller: ProjectController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  const orgMiddleware = requireOrganization(membershipService);

  router.use(authenticate, orgMiddleware);

  router.post('/', requireRole('Manager'), validate(createProjectSchema), controller.create);
  router.get('/', controller.list);
  router.get('/:projectId/statistics', controller.statistics);
  router.get('/:projectId', controller.getById);
  router.patch('/:projectId', requireRole('Manager'), validate(updateProjectSchema), controller.update);
  router.delete('/:projectId', requireRole('Manager'), controller.delete);
  //router.post('/:projectId/archive', requireRole('Manager'), controller.archive);
  router.post('/:projectId/archive', controller.archive);
  router.post('/:projectId/restore', requireRole('Manager'), controller.restore);
  router.post('/:projectId/members', requireRole('Manager'), validate(assignMembersSchema), controller.assignMembers);

  return router;
};

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization, requireRole } from '../../middleware/organization';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  changeStatusSchema,
  taskFilterSchema,
} from './tasks.validation';
import type { TaskController } from './tasks.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createTaskRoutes = (
  controller: TaskController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  const orgMiddleware = requireOrganization(membershipService);

  router.use(authenticate, orgMiddleware);

  router.post('/', validate(createTaskSchema), controller.create);
  router.get('/', validate(taskFilterSchema, 'query'), controller.list);
  router.get('/:taskId', controller.getById);
  router.patch('/:taskId', validate(updateTaskSchema), controller.update);
  router.delete('/:taskId', requireRole('Manager'), controller.delete);
  router.post('/:taskId/assign', validate(assignTaskSchema), controller.assign);
  router.patch('/:taskId/status', validate(changeStatusSchema), controller.changeStatus);

  return router;
};

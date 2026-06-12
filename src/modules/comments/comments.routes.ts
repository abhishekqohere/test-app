import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization } from '../../middleware/organization';
import { validate } from '../../middleware/validate';
import { createCommentSchema, updateCommentSchema } from './comments.validation';
import type { CommentController } from './comments.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createCommentRoutes = (
  controller: CommentController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  const orgMiddleware = requireOrganization(membershipService);

  router.use(authenticate, orgMiddleware);

  router.post('/', validate(createCommentSchema), controller.create);
  router.get('/task/:taskId', controller.list);
  router.patch('/:commentId', validate(updateCommentSchema), controller.update);
  router.delete('/:commentId', controller.delete);

  return router;
};

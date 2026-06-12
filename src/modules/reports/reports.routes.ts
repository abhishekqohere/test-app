import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireOrganization } from '../../middleware/organization';
import type { ReportsController } from './reports.controller';
import type { MembershipService } from '../memberships/memberships.service';

export const createReportsRoutes = (
  controller: ReportsController,
  membershipService: MembershipService,
): Router => {
  const router = Router();
  router.use(authenticate, requireOrganization(membershipService));

  router.get('/tasks-by-status', controller.tasksByStatus);
  router.get('/tasks-by-priority', controller.tasksByPriority);
  router.get('/tasks-per-user', controller.tasksPerUser);
  router.get('/project-progress', controller.projectProgress);
  router.get('/overdue-tasks', controller.overdueTasks);
  router.get('/organization-summary', controller.organizationSummary);

  return router;
};

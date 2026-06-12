import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { createContainer } from './config/container';
import { errorHandler } from './middleware/errorHandler';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { createOrganizationRoutes } from './modules/organizations/organizations.routes';
import { createMembershipRoutes } from './modules/memberships/memberships.routes';
import { createProjectRoutes } from './modules/projects/projects.routes';
import { createTaskRoutes } from './modules/tasks/tasks.routes';
import { createCommentRoutes } from './modules/comments/comments.routes';
import { createNotificationRoutes } from './modules/notifications/notifications.routes';
import { createActivityRoutes } from './modules/activities/activities.routes';
import { createReportsRoutes } from './modules/reports/reports.routes';

export const createApp = () => {
  const app = express();
  const container = createContainer();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests', data: null },
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'OK', data: { status: 'healthy' } });
  });

  app.use('/api/auth', createAuthRoutes(container.authController));
  app.use('/api/organizations', createOrganizationRoutes(
    container.organizationController,
    container.membershipService,
  ));
  app.use(
    '/api/organizations/:organizationId/members',
    createMembershipRoutes(container.membershipController, container.membershipService),
  );
  app.use('/api/projects', createProjectRoutes(container.projectController, container.membershipService));
  app.use('/api/tasks', createTaskRoutes(container.taskController, container.membershipService));
  app.use('/api/comments', createCommentRoutes(container.commentController, container.membershipService));
  app.use('/api/notifications', createNotificationRoutes(
    container.notificationController,
    container.membershipService,
  ));
  app.use('/api/activities', createActivityRoutes(container.activityController, container.membershipService));
  app.use('/api/reports', createReportsRoutes(container.reportsController, container.membershipService));

  app.use(errorHandler);

  return app;
};

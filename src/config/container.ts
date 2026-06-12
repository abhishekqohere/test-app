import { UserRepository } from '../modules/users/users.repository';
import { UserService } from '../modules/users/users.service';
import { AuthRepository } from '../modules/auth/auth.repository';
import { AuthService } from '../modules/auth/auth.service';
import { AuthController } from '../modules/auth/auth.controller';
import { OrganizationRepository } from '../modules/organizations/organizations.repository';
import { OrganizationService } from '../modules/organizations/organizations.service';
import { OrganizationController } from '../modules/organizations/organizations.controller';
import { MembershipRepository } from '../modules/memberships/memberships.repository';
import { MembershipService } from '../modules/memberships/memberships.service';
import { MembershipController } from '../modules/memberships/memberships.controller';
import { ProjectRepository } from '../modules/projects/projects.repository';
import { ProjectService } from '../modules/projects/projects.service';
import { ProjectController } from '../modules/projects/projects.controller';
import { TaskRepository } from '../modules/tasks/tasks.repository';
import { TaskService } from '../modules/tasks/tasks.service';
import { TaskController } from '../modules/tasks/tasks.controller';
import { CommentRepository } from '../modules/comments/comments.repository';
import { CommentService } from '../modules/comments/comments.service';
import { CommentController } from '../modules/comments/comments.controller';
import { NotificationRepository } from '../modules/notifications/notifications.repository';
import { NotificationService } from '../modules/notifications/notifications.service';
import { NotificationController } from '../modules/notifications/notifications.controller';
import { ActivityRepository } from '../modules/activities/activities.repository';
import { ActivityService } from '../modules/activities/activities.service';
import { ActivityController } from '../modules/activities/activities.controller';
import { ReportsRepository } from '../modules/reports/reports.repository';
import { ReportsService } from '../modules/reports/reports.service';
import { ReportsController } from '../modules/reports/reports.controller';

export interface AppContainer {
  authController: AuthController;
  organizationController: OrganizationController;
  membershipController: MembershipController;
  projectController: ProjectController;
  taskController: TaskController;
  commentController: CommentController;
  notificationController: NotificationController;
  activityController: ActivityController;
  reportsController: ReportsController;
  membershipService: MembershipService;
}

export const createContainer = (): AppContainer => {
  const userRepo = new UserRepository();
  const userService = new UserService(userRepo);
  const authRepo = new AuthRepository();
  const activityRepo = new ActivityRepository();
  const activityService = new ActivityService(activityRepo);
  const notificationRepo = new NotificationRepository();
  const notificationService = new NotificationService(notificationRepo);
  const membershipRepo = new MembershipRepository();
  const orgRepo = new OrganizationRepository();
  const projectRepo = new ProjectRepository();
  const taskRepo = new TaskRepository();
  const commentRepo = new CommentRepository();
  const reportsRepo = new ReportsRepository();

  const membershipService = new MembershipService(
    membershipRepo,
    userRepo,
    activityService,
    notificationService,
  );

  const organizationService = new OrganizationService(
    orgRepo,
    membershipRepo,
    userRepo,
    membershipService,
    activityService,
  );

  const authService = new AuthService(userRepo, userService, authRepo, activityService);
  const projectService = new ProjectService(projectRepo, activityService);
  const taskService = new TaskService(taskRepo, projectRepo, activityService, notificationService);
  const commentService = new CommentService(commentRepo, taskRepo, activityService, notificationService);
  const reportsService = new ReportsService(reportsRepo);

  return {
    authController: new AuthController(authService),
    organizationController: new OrganizationController(organizationService),
    membershipController: new MembershipController(membershipService),
    projectController: new ProjectController(projectService),
    taskController: new TaskController(taskService),
    commentController: new CommentController(commentService),
    notificationController: new NotificationController(notificationService),
    activityController: new ActivityController(activityService),
    reportsController: new ReportsController(reportsService),
    membershipService,
  };
};

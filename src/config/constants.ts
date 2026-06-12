export const ROLES = ['Owner', 'Admin', 'Manager', 'Member'] as const;

export const TASK_STATUSES = ['Todo', 'In Progress', 'Review', 'Done'] as const;

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const PROJECT_STATUSES = ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'] as const;

export const ACTIVITY_ACTIONS = {
  USER_LOGIN: 'user.login',
  USER_REGISTER: 'user.register',
  ORG_CREATED: 'organization.created',
  ORG_UPDATED: 'organization.updated',
  ORG_DELETED: 'organization.deleted',
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_ARCHIVED: 'project.archived',
  PROJECT_RESTORED: 'project.restored',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  COMMENT_ADDED: 'comment.added',
  COMMENT_EDITED: 'comment.edited',
  COMMENT_DELETED: 'comment.deleted',
} as const;

export const ENTITY_TYPES = [
  'User',
  'Organization',
  'Membership',
  'Project',
  'Task',
  'Comment',
  'Notification',
] as const;

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task.assigned',
  TASK_COMPLETED: 'task.completed',
  COMMENT_ADDED: 'comment.added',
  MEMBER_ADDED: 'member.added',
} as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

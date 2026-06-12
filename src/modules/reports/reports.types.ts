export interface StatusReportItem {
  status: string;
  count: number;
}

export interface PriorityReportItem {
  priority: string;
  count: number;
}

export interface TasksPerUserItem {
  userId: string;
  count: number;
}

export interface ProjectProgressItem {
  projectId: string;
  projectName: string;
  total: number;
  completed: number;
  progress: number;
}

export interface OverdueTaskItem {
  id: string;
  title: string;
  dueDate: Date;
  assigneeId?: string;
  projectId: string;
}

export interface OrganizationSummary {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalMembers: number;
  overdueTasks: number;
}

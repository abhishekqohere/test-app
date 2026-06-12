import { ReportsRepository } from './reports.repository';

export class ReportsService {
  constructor(private readonly reportsRepo: ReportsRepository) {}

  tasksByStatus(organizationId: string) {
    return this.reportsRepo.tasksByStatus(organizationId);
  }

  tasksByPriority(organizationId: string) {
    return this.reportsRepo.tasksByPriority(organizationId);
  }

  tasksPerUser(organizationId: string) {
    return this.reportsRepo.tasksPerUser(organizationId);
  }

  projectProgress(organizationId: string) {
    return this.reportsRepo.projectProgress(organizationId);
  }

  overdueTasks(organizationId: string) {
    return this.reportsRepo.overdueTasks(organizationId);
  }

  organizationSummary(organizationId: string) {
    return this.reportsRepo.organizationSummary(organizationId);
  }
}

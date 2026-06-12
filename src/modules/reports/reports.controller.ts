import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import type { ReportsService } from './reports.service';

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  tasksByStatus = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.tasksByStatus(req.organizationId!);
    sendSuccess(res, data);
  });

  tasksByPriority = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.tasksByPriority(req.organizationId!);
    sendSuccess(res, data);
  });

  tasksPerUser = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.tasksPerUser(req.organizationId!);
    sendSuccess(res, data);
  });

  projectProgress = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.projectProgress(req.organizationId!);
    sendSuccess(res, data);
  });

  overdueTasks = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.overdueTasks(req.organizationId!);
    sendSuccess(res, data);
  });

  organizationSummary = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.reportsService.organizationSummary(req.organizationId!);
    sendSuccess(res, data);
  });
}

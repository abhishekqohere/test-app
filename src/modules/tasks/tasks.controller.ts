import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { TaskService } from './tasks.service';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.taskService.create(
      req.organizationId!,
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendCreated(res, task);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.taskService.list(req.organizationId!, req.query);
    sendSuccess(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.taskService.getById(req.organizationId!, param(req.params.taskId));
    sendSuccess(res, task);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.taskService.update(
      req.organizationId!,
      param(req.params.taskId),
      req.user!.id,
      req.body,
    );
    sendSuccess(res, task);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.taskService.delete(
      req.organizationId!,
      param(req.params.taskId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, null, 'Task deleted');
  });

  assign = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.taskService.assign(
      req.organizationId!,
      param(req.params.taskId),
      req.user!.id,
      req.body.assigneeId,
    );
    sendSuccess(res, task);
  });

  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const task = await this.taskService.changeStatus(
      req.organizationId!,
      param(req.params.taskId),
      req.user!.id,
      req.body.status,
    );
    sendSuccess(res, task);
  });
}

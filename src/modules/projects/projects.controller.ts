import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { ProjectService } from './projects.service';

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.create(
      req.organizationId!,
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendCreated(res, project);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const includeArchived = req.query.includeArchived === 'true';
    const projects = await this.projectService.list(req.organizationId!, includeArchived);
    sendSuccess(res, projects);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.getById(
      req.organizationId!,
      param(req.params.projectId),
    );
    sendSuccess(res, project);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.update(
      req.organizationId!,
      param(req.params.projectId),
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendSuccess(res, project);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.projectService.delete(
      req.organizationId!,
      param(req.params.projectId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, null, 'Project deleted');
  });

  archive = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.archive(
      req.organizationId!,
      param(req.params.projectId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, project, 'Project archived');
  });

  restore = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.restore(
      req.organizationId!,
      param(req.params.projectId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, project, 'Project restored');
  });

  assignMembers = asyncHandler(async (req: Request, res: Response) => {
    const project = await this.projectService.assignMembers(
      req.organizationId!,
      param(req.params.projectId),
      req.membershipRole!,
      req.body,
    );
    sendSuccess(res, project);
  });

  statistics = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.projectService.getStatistics(
      req.organizationId!,
      param(req.params.projectId),
    );
    sendSuccess(res, stats);
  });
}

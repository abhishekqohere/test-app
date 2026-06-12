import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { EntityType } from '../../utils/types';
import type { ActivityService } from './activities.service';

export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  listByOrganization = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await this.activityService.getByOrganization(req.organizationId!, page, limit);
    sendSuccess(res, result);
  });

  listByEntity = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await this.activityService.getByEntity(
      param(req.params.entityType) as EntityType,
      param(req.params.entityId),
      page,
      limit,
    );
    sendSuccess(res, result);
  });
}

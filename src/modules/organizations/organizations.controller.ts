import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { OrganizationService } from './organizations.service';

export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const org = await this.orgService.create(req.user!.id, req.body);
    sendCreated(res, org, 'Organization created');
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const orgs = await this.orgService.listForUser(req.user!.id);
    sendSuccess(res, orgs);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const org = await this.orgService.getById(param(req.params.organizationId), req.user!.id);
    sendSuccess(res, org);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const org = await this.orgService.update(
      param(req.params.organizationId),
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendSuccess(res, org, 'Organization updated');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.orgService.delete(
      param(req.params.organizationId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, null, 'Organization deleted');
  });

  invite = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.orgService.inviteMember(
      param(req.params.organizationId),
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendCreated(res, member, 'Member invited');
  });

  removeMember = asyncHandler(async (req: Request, res: Response) => {
    await this.orgService.removeMemberViaOrg(
      param(req.params.organizationId),
      param(req.params.membershipId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, null, 'Member removed');
  });
}

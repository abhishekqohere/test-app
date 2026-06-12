import type { Request, Response } from 'express';
import { sendSuccess, sendCreated } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { param } from '../../utils/params';
import type { MembershipService } from './memberships.service';

export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const members = await this.membershipService.listMembers(req.organizationId!);
    sendSuccess(res, members);
  });

  add = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.membershipService.addMember(
      req.organizationId!,
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendCreated(res, member, 'Member added');
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    await this.membershipService.removeMember(
      req.organizationId!,
      param(req.params.membershipId),
      req.user!.id,
      req.membershipRole!,
    );
    sendSuccess(res, null, 'Member removed');
  });

  changeRole = asyncHandler(async (req: Request, res: Response) => {
    const member = await this.membershipService.changeRole(
      req.organizationId!,
      param(req.params.membershipId),
      req.user!.id,
      req.membershipRole!,
      req.body,
    );
    sendSuccess(res, member, 'Role updated');
  });
}

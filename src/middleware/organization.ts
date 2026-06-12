import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../utils/errors';
import type { Role } from '../utils/types';
import { hasMinimumRole } from '../utils/permissions';

export interface MembershipChecker {
  getMembership(userId: string, organizationId: string): Promise<{ role: Role } | null>;
}

export const requireOrganization =
  (membershipService: MembershipChecker) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError());
        return;
      }

      const orgId =
        (req.params.organizationId as string) ||
        (req.headers['x-organization-id'] as string) ||
        (req.body as { organizationId?: string }).organizationId;

      if (!orgId) {
        next(new ValidationError('Organization context required (header x-organization-id or param)'));
        return;
      }

      const membership = await membershipService.getMembership(req.user.id, orgId);
      if (!membership) {
        next(new ForbiddenError('Not a member of this organization'));
        return;
      }

      req.organizationId = orgId;
      req.membershipRole = membership.role;
      next();
    } catch (err) {
      next(err);
    }
  };

export const requireRole =
  (minimumRole: Role) => (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.membershipRole || !hasMinimumRole(req.membershipRole, minimumRole)) {
      next(new ForbiddenError(`Requires ${minimumRole} role or higher`));
      return;
    }
    next();
  };

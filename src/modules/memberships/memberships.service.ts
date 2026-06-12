import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } from '../../config/constants';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  ValidationError,
} from '../../utils/errors';
import { canManageMembers, canChangeRole, canAssignRole } from '../../utils/permissions';
import type { Role } from '../../utils/types';
import { UserRepository } from '../users/users.repository';
import { MembershipRepository } from './memberships.repository';
import type { IMembership } from './memberships.model';
import type { MembershipDTO, AddMemberInput, ChangeRoleInput } from './memberships.types';
import type { ActivityService } from '../activities/activities.service';
import type { NotificationService } from '../notifications/notifications.service';

export class MembershipService {
  constructor(
    private readonly membershipRepo: MembershipRepository,
    private readonly userRepo: UserRepository,
    private readonly activityService?: ActivityService,
    private readonly notificationService?: NotificationService,
  ) {}

  toDTO(m: IMembership): MembershipDTO {
    const user = m.userId as unknown as {
      _id: mongoose.Types.ObjectId;
      email: string;
      firstName: string;
      lastName: string;
    };
    const populated = user && typeof user === 'object' && 'email' in user;
    return {
      id: m._id.toString(),
      userId: populated ? user._id.toString() : m.userId.toString(),
      organizationId: m.organizationId.toString(),
      role: m.role,
      user: populated
        ? {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }
        : undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  async getMembership(userId: string, organizationId: string): Promise<{ role: Role } | null> {
    const m = await this.membershipRepo.findByUserAndOrg(userId, organizationId);
    return m ? { role: m.role } : null;
  }

  async listMembers(organizationId: string): Promise<MembershipDTO[]> {
    const members = await this.membershipRepo.findByOrganization(organizationId);
    return members.map((m) => this.toDTO(m));
  }

  async addMember(
    organizationId: string,
    actorId: string,
    actorRole: Role,
    input: AddMemberInput,
  ): Promise<MembershipDTO> {
    if (!canManageMembers(actorRole)) throw new ForbiddenError();
    if (!canAssignRole(actorRole, input.role)) throw new ForbiddenError('Cannot assign this role');

    const existing = await this.membershipRepo.findByUserAndOrg(input.userId, organizationId);
    if (existing) throw new ConflictError('User is already a member');

    const user = await this.userRepo.findById(input.userId);
    if (!user) throw new NotFoundError('User not found');

    const membership = await this.membershipRepo.create({
      userId: input.userId,
      organizationId,
      role: input.role,
      invitedBy: actorId,
    } as Record<string, unknown>);

    await this.activityService?.log({
      actorId,
      action: ACTIVITY_ACTIONS.MEMBER_ADDED,
      entityType: 'Membership',
      entityId: membership._id.toString(),
      organizationId,
      metadata: { userId: input.userId, role: input.role },
    });

    await this.notificationService?.create({
      userId: input.userId,
      organizationId,
      type: NOTIFICATION_TYPES.MEMBER_ADDED,
      title: 'Added to organization',
      message: `You were added as ${input.role}`,
      entityType: 'Organization',
      entityId: organizationId,
    });

    return this.toDTO(membership);
  }

  async removeMember(
    organizationId: string,
    membershipId: string,
    actorId: string,
    actorRole: Role,
  ): Promise<void> {
    if (!canManageMembers(actorRole)) throw new ForbiddenError();

    const membership = await this.membershipRepo.findById(membershipId);
    if (!membership || membership.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Membership not found');
    }

    if (membership.role === 'Owner') {
      const owners = await this.membershipRepo.countOwners(organizationId, membershipId);
      if (owners === 0) throw new ValidationError('Organization must have at least one owner');
    }

    await this.membershipRepo.softDelete(membershipId);

    await this.activityService?.log({
      actorId,
      action: ACTIVITY_ACTIONS.MEMBER_REMOVED,
      entityType: 'Membership',
      entityId: membershipId,
      organizationId,
      metadata: { userId: membership.userId.toString() },
    });
  }

  async changeRole(
    organizationId: string,
    membershipId: string,
    actorId: string,
    actorRole: Role,
    input: ChangeRoleInput,
  ): Promise<MembershipDTO> {
    if (!canManageMembers(actorRole)) throw new ForbiddenError();
    if (!canAssignRole(actorRole, input.role)) throw new ForbiddenError('Cannot assign this role');

    const membership = await this.membershipRepo.findById(membershipId);
    if (!membership || membership.organizationId.toString() !== organizationId) {
      throw new NotFoundError('Membership not found');
    }

    if (!canChangeRole(actorRole, membership.role)) {
      throw new ForbiddenError('Cannot modify this member');
    }

    if (membership.role === 'Owner' && input.role !== 'Owner') {
      const owners = await this.membershipRepo.countOwners(organizationId, membershipId);
      if (owners === 0) throw new ValidationError('Organization must have at least one owner');
    }

    const updated = await this.membershipRepo.updateRole(membershipId, input.role);
    if (!updated) throw new NotFoundError('Membership not found');

    await this.activityService?.log({
      actorId,
      action: ACTIVITY_ACTIONS.MEMBER_ROLE_CHANGED,
      entityType: 'Membership',
      entityId: membershipId,
      organizationId,
      metadata: { role: input.role },
    });

    return this.toDTO(updated);
  }
}

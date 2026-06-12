import mongoose from 'mongoose';
import { ACTIVITY_ACTIONS } from '../../config/constants';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import { canDeleteOrganization } from '../../utils/permissions';
import type { Role } from '../../utils/types';
import { UserRepository } from '../users/users.repository';
import { MembershipRepository } from '../memberships/memberships.repository';
import { OrganizationRepository } from './organizations.repository';
import type { IOrganization } from './organizations.model';
import type {
  OrganizationDTO,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  InviteMemberInput,
} from './organizations.types';
import type { ActivityService } from '../activities/activities.service';
import type { MembershipService } from '../memberships/memberships.service';

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export class OrganizationService {
  constructor(
    private readonly orgRepo: OrganizationRepository,
    private readonly membershipRepo: MembershipRepository,
    private readonly userRepo: UserRepository,
    private readonly membershipService: MembershipService,
    private readonly activityService?: ActivityService,
  ) {}

  toDTO(org: IOrganization): OrganizationDTO {
    return {
      id: org._id.toString(),
      name: org.name,
      slug: org.slug,
      description: org.description,
      ownerId: org.ownerId.toString(),
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    };
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let counter = 1;
    while (await this.orgRepo.slugExists(slug)) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }

  async create(userId: string, input: CreateOrganizationInput): Promise<OrganizationDTO> {
    const baseSlug = slugify(input.name);
    const slug = await this.uniqueSlug(baseSlug);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const org = await this.orgRepo.create(
        {
          name: input.name,
          slug,
          description: input.description,
          ownerId: userId,
        } as Record<string, unknown>,
        session,
      );

      await this.membershipRepo.create(
        {
          userId,
          organizationId: org._id,
          role: 'Owner',
        } as Record<string, unknown>,
        session,
      );

      await session.commitTransaction();

      await this.activityService?.log({
        actorId: userId,
        action: ACTIVITY_ACTIONS.ORG_CREATED,
        entityType: 'Organization',
        entityId: org._id.toString(),
        organizationId: org._id.toString(),
      });

      return this.toDTO(org);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getById(organizationId: string, userId: string): Promise<OrganizationDTO> {
    const membership = await this.membershipRepo.findByUserAndOrg(userId, organizationId);
    if (!membership) throw new ForbiddenError('Not a member of this organization');
    const org = await this.orgRepo.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    return this.toDTO(org);
  }

  async listForUser(userId: string): Promise<OrganizationDTO[]> {
    const memberships = await this.membershipRepo.findMany({ userId } as Parameters<
      typeof this.membershipRepo.findMany
    >[0]);
    const orgs = await Promise.all(
      memberships.map((m) => this.orgRepo.findById(m.organizationId.toString())),
    );
    return orgs.filter(Boolean).map((o) => this.toDTO(o!));
  }

  async update(
    organizationId: string,
    userId: string,
    role: Role,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationDTO> {
    const membership = await this.membershipRepo.findByUserAndOrg(userId, organizationId);
    if (!membership) throw new ForbiddenError();
    if (role !== 'Owner' && role !== 'Admin') throw new ForbiddenError();

    const update: Partial<IOrganization> = { ...input };
    if (input.name) {
      const baseSlug = slugify(input.name);
      if (baseSlug !== (await this.orgRepo.findById(organizationId))?.slug) {
        update.slug = await this.uniqueSlug(baseSlug);
      }
    }

    const org = await this.orgRepo.updateById(organizationId, update);
    if (!org) throw new NotFoundError('Organization not found');

    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.ORG_UPDATED,
      entityType: 'Organization',
      entityId: organizationId,
      organizationId,
    });

    return this.toDTO(org);
  }

  async delete(organizationId: string, userId: string, role: Role): Promise<void> {
    if (!canDeleteOrganization(role)) throw new ForbiddenError('Only owners can delete organizations');
    const org = await this.orgRepo.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    await this.orgRepo.softDelete(organizationId);
    await this.activityService?.log({
      actorId: userId,
      action: ACTIVITY_ACTIONS.ORG_DELETED,
      entityType: 'Organization',
      entityId: organizationId,
      organizationId,
    });
  }

  async inviteMember(
    organizationId: string,
    actorId: string,
    actorRole: Role,
    input: InviteMemberInput,
  ) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw new NotFoundError('User not found. They must register first.');
    return this.membershipService.addMember(organizationId, actorId, actorRole, {
      userId: user._id.toString(),
      role: input.role,
    });
  }

  async removeMemberViaOrg(
    organizationId: string,
    membershipId: string,
    actorId: string,
    actorRole: Role,
  ): Promise<void> {
    return this.membershipService.removeMember(organizationId, membershipId, actorId, actorRole);
  }
}

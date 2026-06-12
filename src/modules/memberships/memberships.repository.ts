import { BaseRepository } from '../../utils/baseRepository';
import { Membership, type IMembership } from './memberships.model';
import type { Role } from '../../utils/types';

export class MembershipRepository extends BaseRepository<IMembership> {
  constructor() {
    super(Membership);
  }

  async findByUserAndOrg(userId: string, organizationId: string): Promise<IMembership | null> {
    return this.findOne({ userId, organizationId } as Parameters<typeof this.findOne>[0]);
  }

  async findByOrganization(organizationId: string): Promise<IMembership[]> {
    return Membership.find({
      organizationId,
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    })
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async countOwners(organizationId: string, excludeId?: string): Promise<number> {
    const filter: Record<string, unknown> = {
      organizationId,
      role: 'Owner',
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    };
    if (excludeId) filter._id = { $ne: excludeId };
    return Membership.countDocuments(filter);
  }

  async updateRole(id: string, role: Role): Promise<IMembership | null> {
    return this.updateById(id, { role });
  }
}

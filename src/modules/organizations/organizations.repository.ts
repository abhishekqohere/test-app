import { BaseRepository } from '../../utils/baseRepository';
import { Organization, type IOrganization } from './organizations.model';

export class OrganizationRepository extends BaseRepository<IOrganization> {
  constructor() {
    super(Organization);
  }

  async findBySlug(slug: string): Promise<IOrganization | null> {
    return this.findOne({ slug: slug.toLowerCase() } as Parameters<typeof this.findOne>[0]);
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await Organization.countDocuments({
      slug: slug.toLowerCase(),
      $or: [{ isDeleted: { $ne: true } }, { isDeleted: { $exists: false } }],
    });
    return count > 0;
  }
}

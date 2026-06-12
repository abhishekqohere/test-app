import { ActivityRepository } from './activities.repository';
import type { IActivity } from './activities.model';
import type { ActivityDTO, LogActivityInput } from './activities.types';

export class ActivityService {
  constructor(private readonly activityRepo: ActivityRepository) {}

  toDTO(activity: IActivity): ActivityDTO {
    return {
      id: activity._id.toString(),
      actorId: activity.actorId.toString(),
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      organizationId: activity.organizationId?.toString(),
      metadata: activity.metadata,
      createdAt: activity.createdAt,
    };
  }

  async log(input: LogActivityInput): Promise<ActivityDTO> {
    const activity = await this.activityRepo.create(input);
    return this.toDTO(activity);
  }

  async getByOrganization(organizationId: string, page?: number, limit?: number) {
    const result = await this.activityRepo.findByOrganization(organizationId, page, limit);
    return {
      items: result.items.map((a) => this.toDTO(a)),
      meta: result.meta,
    };
  }

  async getByEntity(
    entityType: import('../../utils/types').EntityType,
    entityId: string,
    page?: number,
    limit?: number,
  ) {
    const result = await this.activityRepo.findByEntity(entityType, entityId, page, limit);
    return {
      items: result.items.map((a) => this.toDTO(a)),
      meta: result.meta,
    };
  }
}

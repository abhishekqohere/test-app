import type { EntityType } from '../../utils/types';

export interface ActivityDTO {
  id: string;
  actorId: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface LogActivityInput {
  actorId: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

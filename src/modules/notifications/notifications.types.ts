import type { EntityType } from '../../utils/types';

export interface NotificationDTO {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: string;
  read: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: string;
}

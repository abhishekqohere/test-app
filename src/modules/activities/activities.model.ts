import mongoose, { Schema, type Document } from 'mongoose';
import type { EntityType } from '../../utils/types';

export interface IActivity extends Document {
  actorId: mongoose.Types.ObjectId;
  action: string;
  entityType: EntityType;
  entityId: string;
  organizationId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ organizationId: 1, createdAt: -1 });
activitySchema.index({ actorId: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);

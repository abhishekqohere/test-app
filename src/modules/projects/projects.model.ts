import mongoose, { Schema, type Document } from 'mongoose';
import type { ProjectStatus } from '../../utils/types';

export interface IProject extends Document {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  organizationId: mongoose.Types.ObjectId;
  memberIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  archivedAt?: Date | null;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
      default: 'Planning',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    archivedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

projectSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ organizationId: 1, archivedAt: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);

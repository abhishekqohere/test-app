import mongoose, { Schema, type Document } from 'mongoose';
import type { TaskStatus, TaskPriority } from '../../utils/types';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  dueDate?: Date;
  projectId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  assigneeId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  completedAt?: Date | null;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Done'],
      default: 'Todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

taskSchema.index({ organizationId: 1, projectId: 1, status: 1 });
taskSchema.index({ organizationId: 1, assigneeId: 1, status: 1 });
taskSchema.index({ organizationId: 1, priority: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', taskSchema);

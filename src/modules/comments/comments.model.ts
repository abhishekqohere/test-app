import mongoose, { Schema, type Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  taskId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

commentSchema.index({ taskId: 1, createdAt: -1 });
commentSchema.index({ content: 'text' });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

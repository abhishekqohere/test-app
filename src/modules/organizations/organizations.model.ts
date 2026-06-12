import mongoose, { Schema, type Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ ownerId: 1, isDeleted: 1 });

export const Organization = mongoose.model<IOrganization>('Organization', organizationSchema);

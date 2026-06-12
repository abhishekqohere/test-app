import mongoose, { Schema, type Document } from 'mongoose';
import type { Role } from '../../utils/types';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  globalRole: Role;
  isActive: boolean;
  deletedAt?: Date | null;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    globalRole: {
      type: String,
      enum: ['Owner', 'Admin', 'Manager', 'Member'],
      default: 'Member',
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ isDeleted: 1, isActive: 1 });

export const User = mongoose.model<IUser>('User', userSchema);

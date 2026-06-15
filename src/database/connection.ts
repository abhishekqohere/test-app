import mongoose from 'mongoose';
import { env } from '../config/env';

export const connectDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_UR);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

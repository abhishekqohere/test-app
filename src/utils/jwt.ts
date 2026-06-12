import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from './types';

export const signAccessToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email, type: 'access' } satisfies JwtPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (userId: string, email: string): string =>
  jwt.sign(
    { sub: userId, email, type: 'refresh', jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

export const signResetToken = (userId: string): string =>
  jwt.sign({ sub: userId, type: 'reset' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const verifyResetToken = (token: string): { sub: string } => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; type?: string };
  if (decoded.type !== 'reset') throw new Error('Invalid reset token');
  return decoded;
};

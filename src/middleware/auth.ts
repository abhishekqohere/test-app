import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import type { AuthUser, JwtPayload } from '../utils/types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      organizationId?: string;
      membershipRole?: import('../utils/types').Role;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Access token required'));
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== 'access') {
      next(new UnauthorizedError('Invalid token type'));
      return;
    }
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      firstName: '',
      lastName: '',
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }
  try {
    const decoded = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type === 'access') {
      req.user = { id: decoded.sub, email: decoded.email, firstName: '', lastName: '' };
    }
  } catch {
    // ignore invalid optional token
  }
  next();
};

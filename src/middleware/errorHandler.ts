import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import type { ApiResponse } from '../utils/types';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      message: err.message,
      data: null,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // if (err instanceof ZodError) {
  //   const message = err.issues
  // .map((e) => `${e.path.join(".")}: ${e.message}`)
  // .join("; ");
  //   res.status(400).json({ success: false, message, data: null } satisfies ApiResponse);
  //   return;
  // }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0] as unknown as {
      path: Array<string | number>;
      message: string;
    };
  
    const message = `${firstIssue.path.join(".")}: ${firstIssue.message}`;
  
    res.status(400).json({ success: false, message, data: null } satisfies ApiResponse);
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid identifier', data: null });
    return;
  }

  console.error(err);
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ success: false, message, data: null } satisfies ApiResponse);
};

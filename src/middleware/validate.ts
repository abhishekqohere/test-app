// import type { Request, Response, NextFunction } from 'express';
// import type { ZodSchema } from 'zod';
// import { ValidationError } from '../utils/errors';

// type RequestSource = 'body' | 'query' | 'params';

// export const validate =
//   (schema: ZodSchema, source: RequestSource = 'body') =>
//   (req: Request, _res: Response, next: NextFunction): void => {
//     const result = schema.safeParse(req[source]);
//     if (!result.success) {
//       const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
//       next(new ValidationError(message));
//       return;
//     }
//     req[source] = result.data;
//     next();
//   };


import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

type RequestSource = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');

      next(new ValidationError(message));
      return;
    }

    req[source] = result.data;
    next();
  };
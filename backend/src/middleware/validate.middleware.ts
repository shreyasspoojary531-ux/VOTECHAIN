import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

import { AppError } from '../middleware/errorHandler';

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/**
 * Zod validation middleware. Pass schemas for body/query/params as needed.
 * On failure, raises a 422 AppError with a readable message.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as never;
      if (schemas.params) req.params = schemas.params.parse(req.params) as never;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const path = first.path.join('.');
        next(
          new AppError(
            `${path ? `${path}: ` : ''}${first.message}`,
            422,
            true,
            'VALIDATION_ERROR'
          )
        );
        return;
      }
      next(err);
    }
  };
}

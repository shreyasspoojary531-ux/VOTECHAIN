import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Wraps async controllers so thrown ApiErrors reach errorHandler via next(). */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

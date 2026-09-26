import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { fail } from "../utils/response";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  fail(res, 404, "NOT_FOUND", "Route not found");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    fail(res, err.status, err.code, err.message);
    return;
  }
  logger.error({ err }, "Unhandled error");
  fail(res, 500, "INTERNAL_ERROR", "Something went wrong");
}

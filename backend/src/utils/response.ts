import type { Response } from "express";

export interface ApiError {
  code: string;
  message: string;
}

export function ok(res: Response, data: unknown, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

export function fail(res: Response, status: number, code: string, message: string): Response {
  return res.status(status).json({ success: false, error: { code, message } });
}

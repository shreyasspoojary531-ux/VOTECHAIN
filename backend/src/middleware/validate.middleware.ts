import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: result.error.flatten() },
      });
      return;
    }
    req.body = result.data.body;
    next();
  };

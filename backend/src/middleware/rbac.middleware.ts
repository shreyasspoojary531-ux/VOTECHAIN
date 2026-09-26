import type { NextFunction, Request, Response } from "express";

/** Master-spec name. Must run after authenticate(). 403 if role not allowed. */
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Insufficient role" } });
      return;
    }
    next();
  };

// Backwards-compatible alias
export const requireRole = authorize;

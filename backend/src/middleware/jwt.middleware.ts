import type { NextFunction, Request, Response } from "express";
import * as jwt from "../crypto/jwt";

export interface AuthenticatedUser {
  id: string;
  role: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/** Master-spec name for the JWT middleware. 401 on missing/invalid/expired. */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" } });
    return;
  }

  try {
    const payload = jwt.verify(header.slice("Bearer ".length));
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

// Backwards-compatible alias
export const jwtMiddleware = authenticate;

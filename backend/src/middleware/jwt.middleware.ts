import type { NextFunction, Request, Response } from "express";
import * as jwt from "../crypto/jwt";

export interface AuthenticatedUser {
  id: string;
  role: string;
  sessionId: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const payload = jwt.verify(header.slice("Bearer ".length));
    req.user = { id: payload.userId, role: payload.role, sessionId: payload.sessionId };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request with the authenticated user payload
export interface AuthUserPayload {
  userId: string;
  role: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Verifies the Bearer JWT and attaches the decoded payload to req.user.
 * Responds 401 for missing/invalid/expired tokens.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUserPayload;
    if (!decoded.userId || !decoded.role) {
      throw new AppError('Invalid token payload', 401, true, 'UNAUTHENTICATED');
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    // jsonwebtoken errors (TokenExpiredError, JsonWebTokenError) land here
    logger.debug({ err }, 'JWT verification failed');
    next(new AppError('Invalid or expired token', 401, true, 'UNAUTHENTICATED'));
  }
}

/**
 * Role-based access control. Usage: router.get('/', authenticate, authorize('REGISTRAR'), handler)
 * Responds 403 when the authenticated user's role is not in the allowed list.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401, true, 'UNAUTHENTICATED'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          `Forbidden: requires role ${allowedRoles.join(' or ')}`,
          403,
          true,
          'FORBIDDEN'
        )
      );
      return;
    }
    next();
  };
}

// Convenience alias matching the spec's naming
export const requireRole = authorize;

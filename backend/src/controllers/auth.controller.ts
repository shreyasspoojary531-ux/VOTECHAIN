import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name, aadhaarNumber, role } = req.body;
    const result = await authService.register({ email, password, name, aadhaarNumber, role });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/login
 * Staff -> { jwt, user }. Voters -> { otpRequired: true, pendingToken, user }.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);

    const data: Record<string, unknown> = { ...result };
    if (result.devOtp) data.devOtp = result.devOtp;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/send-otp
 */
export async function sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pendingToken } = req.body as { pendingToken: string };
    const result = await authService.sendOtp(pendingToken);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** POST /auth/verify-otp — consumes the OTP and returns the session JWT. */
export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { pendingToken, otp } = req.body as { pendingToken: string; otp: string };
    const result = await authService.verifyOtp(pendingToken, otp);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** POST /auth/refresh — silent token refresh when expired or near expiry. */
export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const bodyToken = req.body?.token;
    const rawToken = (header && header.startsWith('Bearer ')) ? header.slice(7).trim() : bodyToken;

    if (!rawToken) {
      throw new AppError('Token required for refresh', 401, true, 'TOKEN_REQUIRED');
    }

    const result = await authService.refreshToken(rawToken);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/** POST /auth/logout */
export function logout(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: { message: 'Logged out. Discard the token client-side.' },
  });
}

/** GET /auth/me — requires authenticate() middleware. */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401, true, 'UNAUTHENTICATED');
    }
    const user = await authService.me(req.user.userId);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

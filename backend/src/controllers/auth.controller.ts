import { Request, Response, NextFunction } from 'express';

import { authService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /auth/login
 * Staff -> { jwt, user }. Voters -> { otpRequired: true, pendingToken, user }.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);

    // devOtp surfaces only in development; strip the key entirely otherwise
    const data: Record<string, unknown> = { ...result };
    if (result.devOtp) data.devOtp = result.devOtp;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/send-otp — issues an OTP for a pending voter login challenge.
 * Responds with devOtp only in development.
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

/** POST /auth/logout — stateless JWT: client discards the token. */
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

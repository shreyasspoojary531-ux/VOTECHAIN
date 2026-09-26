import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { OTPPurpose } from '@prisma/client';

import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import type { AuthUserPayload } from '../middleware/auth.middleware';
import { userRepository, PublicUser } from '../repositories/user.repository';
import { otpRepository } from '../repositories/otp.repository';
import { generateOtp, hashOtp, verifyOtpHash, otpExpiry } from '../crypto/otp';
import { logger } from '../utils/logger';

/** Staff roles verified in person — no OTP second factor required for login. */
const STAFF_ROLES = new Set(['REGISTRAR', 'ADMIN', 'AUDITOR']);

/** OTP send rate limit: max 5 requests per user per 15 minutes. */
const OTP_SEND_WINDOW_MS = 15 * 60_000;
const OTP_SEND_MAX = 5;

/**
 * Consumed pending-token revocation cache (jti -> expiry).
 * DEV-ADEQUATE: in-process only. Production should back this with Redis so
 * revocation survives restarts and works across replicas.
 */
const consumedPendingTokens = new Map<string, number>();
const PENDING_TOKEN_TTL_MS = 10 * 60_000;

export interface LoginResult {
  /** Full JWT — issued immediately for staff, only after OTP for voters. */
  jwt: string | null;
  user: PublicUser;
  /** True when the password was correct but an OTP challenge is required. */
  otpRequired: boolean;
  /** Short-lived token identifying the pending OTP challenge (voters only). */
  pendingToken: string | null;
  /** OTP plaintext — ONLY populated when NODE_ENV=development. */
  devOtp: string | null;
}

export interface VerifyOtpResult {
  jwt: string;
  user: PublicUser;
}

export const authService = {
  /**
   * Step 1: verify email + password.
   * - Staff: returns the session JWT immediately.
   * - Voter: returns a pendingToken; the JWT comes only after OTP verification.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());

    // Uniform error for unknown email / wrong password / inactive account
    const invalid = new AppError('Invalid email or password', 401, true, 'INVALID_CREDENTIALS');
    if (!user || !user.isActive) throw invalid;

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) throw invalid;

    const publicUser = await userRepository.findById(user.id);
    if (!publicUser) throw invalid;

    if (STAFF_ROLES.has(user.role)) {
      return { jwt: issueJwt(user.id, user.role, user.email), user: publicUser, otpRequired: false, pendingToken: null, devOtp: null };
    }

    // Voter: password ok, OTP challenge pending
    return {
      jwt: null,
      user: publicUser,
      otpRequired: true,
      pendingToken: issuePendingToken(user.id),
      devOtp: null,
    };
  },

  /**
   * Step 2a: issue an OTP for a pending voter challenge.
   * The pendingToken binds the request to the user that passed password verification.
   */
  async sendOtp(pendingToken: string): Promise<{ sent: boolean; devOtp: string | null }> {
    const { userId, jti } = verifyPendingToken(pendingToken);
    assertNotConsumed(jti);

    const recentCount = await otpRepository.countRecentRequests(userId, new Date(Date.now() - OTP_SEND_WINDOW_MS));
    if (recentCount >= OTP_SEND_MAX) {
      throw new AppError('Too many OTP requests. Try again later.', 429, true, 'OTP_RATE_LIMIT');
    }

    const otp = generateOtp();
    await otpRepository.create(userId, hashOtp(otp), OTPPurpose.LOGIN, otpExpiry());

    // Development convenience: return OTP in the response. NEVER in production.
    const devOtp = config.NODE_ENV === 'development' ? otp : null;
    logger.info({ userId }, 'OTP issued'); // never log the OTP itself
    return { sent: true, devOtp };
  },

  /**
   * Step 2b: verify the OTP and issue the session JWT.
   * Single-use: the OTP is consumed atomically on success, and the pending
   * token is revoked so it cannot start another challenge afterwards.
   */
  async verifyOtp(pendingToken: string, rawOtp: string): Promise<VerifyOtpResult> {
    const { userId, jti } = verifyPendingToken(pendingToken);
    assertNotConsumed(jti);

    const stored = await otpRepository.findLatestValid(userId, OTPPurpose.LOGIN);
    if (!stored) {
      throw new AppError('OTP expired or not requested', 400, true, 'OTP_INVALID');
    }

    if (!verifyOtpHash(rawOtp, stored.codeHash)) {
      throw new AppError('Incorrect OTP', 400, true, 'OTP_MISMATCH');
    }

    const consumed = await otpRepository.consume(stored.id);
    if (!consumed) {
      throw new AppError('OTP already used', 400, true, 'OTP_ALREADY_USED');
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('Account unavailable', 403, true, 'ACCOUNT_UNAVAILABLE');
    }

    // Challenge complete: revoke the pending token
    consumedPendingTokens.set(jti, Date.now() + PENDING_TOKEN_TTL_MS);

    return { jwt: issueJwt(user.id, user.role, user.email), user };
  },

  /** Current user projection for GET /auth/me. */
  async me(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, true, 'USER_NOT_FOUND');
    }
    return user;
  },
};

/** Session JWT — payload is exactly { userId, role, email }. */
function issueJwt(userId: string, role: string, email: string): string {
  const payload: AuthUserPayload = { userId, role, email };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);
}

/** Short-lived (10 min) token that only proves "password OK, awaiting OTP". */
function issuePendingToken(userId: string): string {
  return jwt.sign({ userId, scope: 'otp-pending', jti: crypto.randomUUID() }, config.JWT_SECRET, {
    expiresIn: '10m',
  });
}

/** Validate a pending token; reject session JWTs used in the OTP flow and vice versa. */
function verifyPendingToken(token: string): { userId: string; jti: string } {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId?: string;
      scope?: string;
      jti?: string;
    };
    if (!decoded.userId || decoded.scope !== 'otp-pending' || !decoded.jti) {
      throw new Error('wrong scope');
    }
    return { userId: decoded.userId, jti: decoded.jti };
  } catch {
    throw new AppError('Invalid or expired session challenge', 401, true, 'INVALID_PENDING_TOKEN');
  }
}

/** Reject pending tokens that were already consumed by a successful verification. */
function assertNotConsumed(jti: string): void {
  const expiry = consumedPendingTokens.get(jti);
  if (expiry !== undefined) {
    if (expiry > Date.now()) {
      throw new AppError('Login challenge already completed', 401, true, 'PENDING_TOKEN_CONSUMED');
    }
    consumedPendingTokens.delete(jti); // lazy cleanup of expired entries
  }
}

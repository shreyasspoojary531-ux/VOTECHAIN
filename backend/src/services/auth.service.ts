import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { OTPPurpose, Role } from '@prisma/client';

import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import type { AuthUserPayload } from '../middleware/auth.middleware';
import { userRepository, PublicUser } from '../repositories/user.repository';
import { otpRepository } from '../repositories/otp.repository';
import { aadhaarRepository } from '../repositories/aadhaar.repository';
import { generateOtp, hashOtp, verifyOtpHash, otpExpiry } from '../crypto/otp';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';

/** Staff roles verified in person — no OTP second factor required for login. */
const STAFF_ROLES = new Set(['REGISTRAR', 'ADMIN', 'AUDITOR']);

/** OTP send rate limit: max 5 requests per user per 15 minutes. */
const OTP_SEND_WINDOW_MS = 15 * 60_000;
const OTP_SEND_MAX = 5;

/**
 * Consumed pending-token revocation cache (jti -> expiry).
 */
const consumedPendingTokens = new Map<string, number>();
const PENDING_TOKEN_TTL_MS = 10 * 60_000;

export interface LoginResult {
  jwt: string | null;
  user: PublicUser;
  otpRequired: boolean;
  pendingToken: string | null;
  devOtp: string | null;
}

export interface VerifyOtpResult {
  jwt: string;
  user: PublicUser;
}

export const authService = {
  /** Voter Self-Registration via Aadhaar Verification */
  async register(input: {
    email: string;
    password: string;
    name?: string;
    aadhaarNumber?: string;
    role?: string;
  }): Promise<{ user: PublicUser; jwt: string }> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('Email address already registered', 409, true, 'EMAIL_EXISTS');
    }

    let aadhaarId: string | undefined;

    if (input.aadhaarNumber) {
      const aadhaarList = await aadhaarRepository.searchByNameOrNumber({ aadhaarNumber: input.aadhaarNumber });
      const aadhaar = aadhaarList[0];
      if (!aadhaar) {
        throw new AppError('Aadhaar number not found in government database', 404, true, 'AADHAAR_NOT_FOUND');
      }

      if (aadhaar.alreadyRegistered) {
        throw new AppError('This Aadhaar identity is already registered as a voter', 409, true, 'ALREADY_REGISTERED');
      }

      // Age gate check (>= 18 years)
      const now = new Date();
      const ageMs = now.getTime() - aadhaar.dateOfBirth.getTime();
      const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
      if (ageYears < 18) {
        throw new AppError('Citizen must be at least 18 years old to register to vote', 400, true, 'UNDERAGE_VOTER');
      }

      aadhaarId = aadhaar.id;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const assignedRole = (input.role as Role) || Role.VOTER;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: assignedRole,
          isActive: true,
        },
      });

      if (aadhaarId) {
        const registrar = await tx.user.findFirst({ where: { role: Role.REGISTRAR } });
        const admin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
        const registrarId = registrar?.id || admin?.id || newUser.id;

        await tx.voterProfile.create({
          data: {
            userId: newUser.id,
            aadhaarId,
            registeredByUserId: registrarId,
          },
        });
      }

      return newUser;
    });

    const publicUser = await userRepository.findById(user.id);
    if (!publicUser) {
      throw new AppError('Error creating user profile', 500, false, 'INTERNAL_SERVER_ERROR');
    }

    const jwtToken = issueJwt(user.id, user.role, user.email);
    return { user: publicUser, jwt: jwtToken };
  },

  /**
   * Step 1: verify email + password.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());

    const invalid = new AppError('Invalid email or password', 401, true, 'INVALID_CREDENTIALS');
    if (!user || !user.isActive) throw invalid;

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) throw invalid;

    const publicUser = await userRepository.findById(user.id);
    if (!publicUser) throw invalid;

    if (STAFF_ROLES.has(user.role)) {
      return { jwt: issueJwt(user.id, user.role, user.email), user: publicUser, otpRequired: false, pendingToken: null, devOtp: null };
    }

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

    const devOtp = config.NODE_ENV === 'development' ? otp : null;
    logger.info({ userId }, 'OTP issued');
    return { sent: true, devOtp };
  },

  /**
   * Step 2b: verify the OTP and issue the session JWT.
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

    consumedPendingTokens.set(jti, Date.now() + PENDING_TOKEN_TTL_MS);

    return { jwt: issueJwt(user.id, user.role, user.email), user };
  },

  /** Silent Token Refresh */
  async refreshToken(expiredOrCurrentToken: string): Promise<{ jwt: string; user: PublicUser }> {
    try {
      const decoded = jwt.verify(expiredOrCurrentToken, config.JWT_SECRET, {
        ignoreExpiration: true,
      }) as AuthUserPayload;

      if (!decoded.userId) {
        throw new AppError('Invalid token payload', 401, true, 'INVALID_TOKEN');
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User account not found or disabled', 401, true, 'ACCOUNT_UNAVAILABLE');
      }

      const newJwt = issueJwt(user.id, user.role, user.email);
      return { jwt: newJwt, user };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Could not refresh token', 401, true, 'REFRESH_FAILED');
    }
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

function issueJwt(userId: string, role: string, email: string): string {
  const payload: AuthUserPayload = { userId, role, email };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as SignOptions);
}

function issuePendingToken(userId: string): string {
  return jwt.sign({ userId, scope: 'otp-pending', jti: crypto.randomUUID() }, config.JWT_SECRET, {
    expiresIn: '10m',
  });
}

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

function assertNotConsumed(jti: string): void {
  const expiry = consumedPendingTokens.get(jti);
  if (expiry !== undefined) {
    if (expiry > Date.now()) {
      throw new AppError('Login challenge already completed', 401, true, 'PENDING_TOKEN_CONSUMED');
    }
    consumedPendingTokens.delete(jti);
  }
}

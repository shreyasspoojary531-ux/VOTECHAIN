import crypto from "crypto";
import * as passwordCrypto from "../crypto/password";
import * as otpCrypto from "../crypto/otp";
import * as jwt from "../crypto/jwt";
import { config } from "../config";
import { logger } from "../utils/logger";
import { ApiError } from "../middleware/errorHandler";
import * as userRepo from "../repositories/user.repository";
import * as otpRepo from "../repositories/otp.repository";
import { logEvent } from "./audit.service";

const GENERIC_LOGIN_ERROR = new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or OTP");

/** Shared OTP-send engine used by send-otp, register, and login. */
async function sendOtp(userId: string, email: string, purpose: "LOGIN" | "REGISTRATION"): Promise<void> {
  await otpRepo.invalidatePrior(userId, purpose);

  const code = otpCrypto.generateCode();
  const codeHash = otpCrypto.hashCode(code);
  const expiresAt = new Date(Date.now() + config.otp.ttlMinutes * 60 * 1000);

  await otpRepo.createOtp({ userId, purpose, codeHash, expiresAt });

  // Demo "delivery": log via Pino. Never returned in API responses.
  logger.info({ email, purpose, code }, "OTP generated (demo delivery via log)");

  await logEvent({
    eventType: "OTP_SENT",
    actorUserId: userId,
    metadata: { purpose },
  });
}

export async function register(email: string, password: string) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    // Same generic message as success — don't leak account existence.
    return { userId: null, message: "If the email is new, OTP sent, verify to activate" };
  }

  const passwordHash = await passwordCrypto.hash(password);
  const user = await userRepo.createUser({ email, passwordHash }); // role VOTER, status INACTIVE by default

  await sendOtp(user.id, user.email, "REGISTRATION");

  return { userId: user.id, message: "OTP sent, verify to activate" };
}

export async function sendOtpFor(email: string, purpose: "LOGIN" | "REGISTRATION") {
  const user = await userRepo.findByEmail(email);
  // Generic response either way — don't reveal whether the email exists.
  const message = "If the account exists, an OTP has been sent";
  if (user) {
    await sendOtp(user.id, user.email, purpose);
  }
  return { message };
}

export async function login(email: string, password: string) {
  const user = await userRepo.findByEmail(email);

  // Generic 401 regardless of which check fails — never reveal the reason.
  if (!user || user.status !== "ACTIVE" || !(await passwordCrypto.compare(password, user.passwordHash))) {
    await logEvent({ eventType: "AUTH_LOGIN", metadata: { email, result: "failure" } });
    throw GENERIC_LOGIN_ERROR;
  }

  await sendOtp(user.id, user.email, "LOGIN");
  await logEvent({ eventType: "AUTH_LOGIN", actorUserId: user.id, metadata: { result: "password_ok_otp_sent" } });

  return { message: "OTP sent" };
}

export async function verifyOtp(email: string, code: string, purpose: "LOGIN" | "REGISTRATION") {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw GENERIC_LOGIN_ERROR;
  }

  const otp = await otpRepo.findLatestValid(user.id, purpose);
  if (!otp || !otpCrypto.compareCode(code, otp.codeHash)) {
    throw new ApiError(401, "INVALID_OTP", "Invalid or expired code");
  }

  await otpRepo.markConsumed(otp.id);
  await logEvent({ eventType: "OTP_VERIFIED", actorUserId: user.id, metadata: { purpose } });

  if (purpose === "REGISTRATION") {
    await userRepo.activateUser(user.id);
    return { activated: true as const, message: "Account activated. You can now log in." };
  }

  // LOGIN → issue JWT. Payload: userId, role, email ONLY.
  const token = jwt.sign({ userId: user.id, role: user.role, email: user.email });
  return {
    activated: undefined,
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}

export async function logout(userId: string, token: string | undefined) {
  // Access-JWT-only design: stateless logout. JWTs expire on their own
  // (JWT_EXPIRES_IN); clients discard the token. We record the audit event.
  await logEvent({
    eventType: "AUTH_LOGOUT",
    actorUserId: userId,
    metadata: { tokenPrefix: token ? token.slice(0, 12) : undefined },
  });
  return { message: "Logged out" };
}

export async function getCurrentUser(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) return null;
  // Never expose passwordHash.
  return { id: user.id, email: user.email, role: user.role, isActive: user.status === "ACTIVE" };
}

import crypto from 'crypto';

import { config } from '../config';

/** Generate a cryptographically random 6-digit OTP (zero-padded). */
export function generateOtp(): string {
  // Random integer in [0, 1_000_000), formatted to exactly 6 digits
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Hash an OTP with the server-side pepper (never store raw OTPs). */
export function hashOtp(otp: string): string {
  return crypto
    .createHmac('sha256', config.OTP_PEPPER)
    .update(otp)
    .digest('hex');
}

/** Constant-time comparison of a raw OTP against a stored HMAC hash. */
export function verifyOtpHash(rawOtp: string, storedHash: string): boolean {
  const candidate = hashOtp(rawOtp);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(storedHash));
}

/** Expiry timestamp for a newly issued OTP. */
export function otpExpiry(): Date {
  return new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60_000);
}

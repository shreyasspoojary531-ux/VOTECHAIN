import crypto from "crypto";
import { config } from "../config";

/**
 * OTP hashing approach: HMAC-SHA256(code, server-side pepper from env).
 * Chosen over bcrypt because OTP codes are only 6 digits — bcrypt's cost
 * provides no meaningful extra protection against a 1,000,000-combination
 * brute force, while HMAC keeps hashing instant and the pepper (not in the
 * DB) makes DB-dump attacks infeasible. Documented in MEMORY.md.
 */

export function generateCode(): string {
  // Cryptographically random 6-digit numeric code, zero-padded.
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string): string {
  return crypto
    .createHmac("sha256", config.otp.pepper)
    .update(code)
    .digest("hex");
}

export function compareCode(code: string, codeHash: string): boolean {
  const candidate = Buffer.from(hashCode(code), "hex");
  const expected = Buffer.from(codeHash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

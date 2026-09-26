import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  jwt: {
    secret: required("JWT_SECRET"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  },
  otp: {
    /** Server-side pepper mixed into HMAC-SHA256 code hashing. */
    pepper: required("OTP_PEPPER"),
    /** OTP validity window in minutes. */
    ttlMinutes: 5,
  },
} as const;

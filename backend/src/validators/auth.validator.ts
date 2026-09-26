import { z } from 'zod';

/** POST /auth/login */
export const loginBodySchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

/** POST /auth/send-otp and /auth/verify-otp — pendingToken identifies the challenge. */
export const sendOtpBodySchema = z.object({
  pendingToken: z.string().min(10, 'pendingToken is required'),
});

export const verifyOtpBodySchema = z.object({
  pendingToken: z.string().min(10, 'pendingToken is required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
export type SendOtpBody = z.infer<typeof sendOtpBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;

import { z } from 'zod';

/** POST /auth/register */
export const registerBodySchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().optional(),
  aadhaarNumber: z.string().trim().regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits').optional(),
  role: z.enum(['REGISTRAR', 'VOTER', 'ADMIN', 'AUDITOR']).optional(),
});

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

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type SendOtpBody = z.infer<typeof sendOtpBodySchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;

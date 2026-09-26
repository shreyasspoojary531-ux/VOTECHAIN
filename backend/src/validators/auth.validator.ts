import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    purpose: z.enum(["LOGIN", "REGISTRATION"]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
    purpose: z.enum(["LOGIN", "REGISTRATION"]),
  }),
});

export type RegisterBody = z.infer<typeof registerSchema>["body"];
export type SendOtpBody = z.infer<typeof sendOtpSchema>["body"];
export type LoginBody = z.infer<typeof loginSchema>["body"];
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>["body"];

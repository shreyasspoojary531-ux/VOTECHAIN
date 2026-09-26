import rateLimit from "express-rate-limit";

/** Global limiter — applies to every /api route. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again later" },
});

/** Strict limiter for OTP endpoints — brute-force protection on code guessing. */
export const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP attempts, try again in a minute" },
});

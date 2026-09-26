import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerBodySchema,
  loginBodySchema,
  sendOtpBodySchema,
  verifyOtpBodySchema,
} from '../validators/auth.validator';
import { register, login, sendOtp, verifyOtp, refreshToken, logout, me } from '../controllers/auth.controller';

const router = Router();

/** POST /api/v1/auth/register — voter registration */
router.post('/register', validate({ body: registerBodySchema }), register);

/** POST /api/v1/auth/login — password check; staff get JWT, voters get pendingToken. */
router.post('/login', validate({ body: loginBodySchema }), login);

/** POST /api/v1/auth/send-otp — issue OTP for a pending voter challenge. */
router.post('/send-otp', validate({ body: sendOtpBodySchema }), sendOtp);

/** POST /api/v1/auth/verify-otp — consume OTP, issue session JWT. */
router.post('/verify-otp', validate({ body: verifyOtpBodySchema }), verifyOtp);

/** POST /api/v1/auth/refresh — silent token refresh (returns new valid JWT token). */
router.post('/refresh', refreshToken);

/** POST /api/v1/auth/logout — stateless; client discards token. */
router.post('/logout', logout);

/** GET /api/v1/auth/me — current user from JWT. */
router.get('/me', authenticate, me);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginBodySchema,
  sendOtpBodySchema,
  verifyOtpBodySchema,
} from '../validators/auth.validator';
import { login, sendOtp, verifyOtp, logout, me } from '../controllers/auth.controller';

const router = Router();

/** POST /api/v1/auth/register — registration request placeholder. */
router.post('/register', (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Voter registration is handled by the Registrar portal via Aadhaar verification.' },
  });
});

/** POST /api/v1/auth/login — password check; staff get JWT, voters get pendingToken. */
router.post('/login', validate({ body: loginBodySchema }), login);

/** POST /api/v1/auth/send-otp — issue OTP for a pending voter challenge. */
router.post('/send-otp', validate({ body: sendOtpBodySchema }), sendOtp);

/** POST /api/v1/auth/verify-otp — consume OTP, issue session JWT. */
router.post('/verify-otp', validate({ body: verifyOtpBodySchema }), verifyOtp);

/** POST /api/v1/auth/logout — stateless; client discards token. */
router.post('/logout', logout);

/** GET /api/v1/auth/me — current user from JWT. */
router.get('/me', authenticate, me);

export default router;

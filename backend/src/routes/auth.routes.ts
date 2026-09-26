import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, sendOtpSchema, loginSchema, verifyOtpSchema } from "../validators/auth.validator";
import { jwtMiddleware } from "../middleware/jwt.middleware";
import { otpLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/send-otp", otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.get("/me", jwtMiddleware, authController.me);

export default router;

import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  sendOtpSchema,
  verifyOtpSchema,
  loginPhoneSchema,
  loginEmailSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login/phone', authLimiter, validate(loginPhoneSchema), authController.loginPhone);
router.post('/login/email', authLimiter, validate(loginEmailSchema), authController.loginEmail);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuth);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authenticate, authController.logout);

export default router;

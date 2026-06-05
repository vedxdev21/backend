import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number. Use format: +91XXXXXXXXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
});

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number. Use format: +91XXXXXXXXXX'),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const loginPhoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const loginEmailSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
});

export const resetPasswordSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Generous limits for development — tighten in production
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful preflight & health checks
  skip: (req) => req.method === 'OPTIONS',
});

/**
 * Stricter limiter for auth endpoints (login, register, OTP)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict limiter for OTP send endpoint
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 5 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

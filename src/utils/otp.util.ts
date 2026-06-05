import crypto from 'crypto';
import { env } from '../config/env';
import { OTP } from '../config/constants';
import cache from '../config/redis';
import axios from 'axios';

/**
 * Generate a random numeric OTP
 */
export const generateOtp = (length: number = OTP.LENGTH): string => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max).toString();
};

/**
 * Store OTP in Redis with TTL (or return for DB storage)
 */
export const storeOtp = async (phone: string, otp: string): Promise<void> => {
  const key = `otp:${phone}`;
  await cache.set(key, otp, OTP.EXPIRY_MINUTES * 60);
};

/**
 * Verify OTP from Redis
 */
export const verifyStoredOtp = async (phone: string, otp: string): Promise<boolean> => {

  const key = `otp:${phone}`;
  const storedOtp = await cache.get(key);
  if (storedOtp === otp) {
    await cache.del(key); // One-time use
    return true;
  }
  return false;
};

/**
 * Check rate limit for OTP requests
 */
export const checkOtpRateLimit = async (phone: string): Promise<boolean> => {
  const key = `otp_limit:${phone}`;
  const exists = await cache.exists(key);
  if (exists) return false; // Still in cooldown
  await cache.set(key, '1', OTP.COOLDOWN_SECONDS);
  return true;
};

/**
 * Send OTP via configured SMS provider
 */
export const sendOtp = async (phone: string, otp: string): Promise<boolean> => {
  const provider = env.SMS_PROVIDER;

  switch (provider) {
    case 'console':
      // Development mode — log to console
      console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
      return true;

    case 'msg91':
      try {
        await axios.post(
          'https://control.msg91.com/api/v5/otp',
          {
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: phone.replace('+', ''),
            otp,
          },
          {
            headers: {
              authkey: env.SMS_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );
        return true;
      } catch (err) {
        console.error('MSG91 OTP error:', err);
        return false;
      }

    case 'twilio':
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;
        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          new URLSearchParams({
            To: phone,
            From: from || '',
            Body: `Your ProjectX verification code is: ${otp}. Valid for ${OTP.EXPIRY_MINUTES} minutes.`,
          }),
          {
            auth: { username: accountSid || '', password: authToken || '' },
          }
        );
        return true;
      } catch (err) {
        console.error('Twilio OTP error:', err);
        return false;
      }

    default:
      console.log(`📱 OTP for ${phone}: ${otp}`);
      return true;
  }
};

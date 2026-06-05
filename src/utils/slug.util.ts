import slugify from 'slugify';
import crypto from 'crypto';

/**
 * Generate a URL-friendly slug from text with a random suffix
 */
export const generateSlug = (text: string): string => {
  const base = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
  const suffix = crypto.randomBytes(3).toString('hex'); // 6 char random
  return `${base}-${suffix}`;
};

/**
 * Generate a unique referral code
 */
export const generateReferralCode = (name: string): string => {
  const prefix = name
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
};

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET must be at least 10 chars'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  // SMS
  SMS_PROVIDER: z.enum(['console', 'twilio', 'msg91']).default('console'),
  SMS_API_KEY: z.string().default(''),
  SMS_SENDER_ID: z.string().default('PROJX'),

  // Email notifications
  EMAIL_NOTIFICATIONS_ENABLED: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default(''),

  // App
  APP_NAME: z.string().default('ProjectX'),
  APP_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,https://www.fyndkaro.com,https://fyndkaro.com'),
  GEOCODING_PROVIDER: z.enum(['locationiq', 'fallback']).default('locationiq'),
  LOCATIONIQ_BASE_URL: z.string().default('https://us1.locationiq.com'),
  LOCATIONIQ_ACCESS_TOKEN: z.string().default(''),
  LOCATIONIQ_USER_AGENT: z.string().default('ProjectX/1.0 (location-service)'),

  // Admin
  ADMIN_EMAIL: z.string().default('admin@projectx.in'),
  ADMIN_PASSWORD: z.string().default('admin123456'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

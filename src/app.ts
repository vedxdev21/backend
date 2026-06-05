import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { languageMiddleware } from './middleware/language.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import locationRoutes from './modules/location/location.routes';
import propertyRoutes from './modules/property/property.routes';
import roommateRoutes from './modules/roommate/roommate.routes';
import messRoutes from './modules/mess/mess.routes';
import cookRoutes from './modules/cook/cook.routes';
import chatRoutes from './modules/chat/chat.routes';
import notificationRoutes from './modules/notification/notification.routes';
import reviewRoutes from './modules/review/review.routes';
import comingSoonRoutes from './modules/coming-soon/comingSoon.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ---- Global Middleware ----
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, '')),
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(languageMiddleware);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---- Rate Limiting ----
app.use('/api/', apiLimiter);

// ---- Health Check ----
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 ProjectX API is running',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes (v1) ----
const v1 = '/api/v1';
app.use(`${v1}/auth`, authRoutes);
app.use(`${v1}/users`, userRoutes);
app.use(`${v1}/user`, userRoutes);
app.use(`${v1}/location`, locationRoutes);
app.use(`${v1}/properties`, propertyRoutes);
app.use(`${v1}/roommate`, roommateRoutes);
app.use(`${v1}/mess`, messRoutes);
app.use(`${v1}/cook`, cookRoutes);
app.use(`${v1}/chat`, chatRoutes);
app.use(`${v1}/notifications`, notificationRoutes);
app.use(`${v1}/reviews`, reviewRoutes);
app.use(`${v1}/coming-soon`, comingSoonRoutes);
app.use(`${v1}/admin`, adminRoutes);

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Check the API documentation.',
  });
});

// ---- Global Error Handler ----
app.use(errorHandler);

export default app;

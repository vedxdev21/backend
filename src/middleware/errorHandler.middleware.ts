import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';

/**
 * Global error handler — catches all unhandled errors
 * Must be registered as the LAST middleware
 */
export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`❌ Error [${req.method} ${req.path}]:`, err.message);

  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Multer file size error
  if (err.message?.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
    sendError(res, 'File size exceeds the 5MB limit', 400);
    return;
  }

  // Multer file type error
  if (err.message?.includes('File type')) {
    sendError(res, err.message, 400);
    return;
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    sendError(res, 'A record with this value already exists', 409);
    return;
  }

  if (err.code === 'P2025') {
    sendError(res, 'Record not found', 404);
    return;
  }

  // JSON parse error
  if (err.message?.includes('JSON')) {
    sendError(res, 'Invalid JSON in request body', 400);
    return;
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  sendError(res, message, statusCode);
};

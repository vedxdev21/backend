import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';

/**
 * Verify JWT access token from Authorization header
 * Attaches decoded user payload to req.user
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendUnauthorized(res, 'Access token is required');
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    sendUnauthorized(res, 'Invalid or expired access token');
    return;
  }

  req.user = decoded;
  next();
};

/**
 * Optional authentication — doesn't fail if no token, just attaches user if present
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

/**
 * Role-based authorization — must be used after authenticate middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'You do not have permission to access this resource');
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = authorize('ADMIN');

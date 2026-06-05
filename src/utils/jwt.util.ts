import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtUserPayload } from '../types/common.types';

export const generateAccessToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as SignOptions);
};

export const generateRefreshToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtUserPayload | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtUserPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
};

export const generateTokenPair = (payload: JwtUserPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

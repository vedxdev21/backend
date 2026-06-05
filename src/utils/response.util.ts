import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types/common.types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: PaginationMeta
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): void => {
  sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string = 'Something went wrong',
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
};

export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  sendError(res, message, 404);
};

export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendError(res, message, 403);
};

export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  errors?: Record<string, string[]>
): void => {
  sendError(res, message, 400, errors);
};

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendBadRequest } from '../utils/response.util';

/**
 * Validate request body, query, or params against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || 'general';
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      sendBadRequest(res, 'Validation failed', errors);
      return;
    }

    // Replace with parsed/transformed data
    if (source === 'body') req.body = result.data;
    next();
  };
};

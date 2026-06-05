import { Request, Response, NextFunction } from 'express';

/**
 * Language detection middleware
 * Reads Accept-Language header or x-language custom header
 */
export const languageMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const lang =
    (req.headers['x-language'] as string) ||
    (req.headers['accept-language']?.startsWith('hi') ? 'hi' : 'en');

  req.language = lang === 'hi' ? 'hi' : 'en';
  next();
};

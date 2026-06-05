import { JwtPayload } from 'jsonwebtoken';

// Express 5 params type fix — coerce to string
type Param = string | string[] | undefined;
export const s = (v: Param): string => (Array.isArray(v) ? v[0] : v) || '';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        role: string;
        name: string;
      } & JwtPayload;
      language?: string;
    }
  }
}

export {};

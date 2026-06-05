export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LocationQuery {
  lat?: number;
  lng?: number;
  city?: string;
  area?: string;
  radius?: number;
}

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number];
  [key: string]: unknown; // Index signature for Prisma InputJsonValue compatibility
}

export interface JwtUserPayload {
  id: string;
  phone: string;
  role: string;
  name: string;
}

/**
 * Helper to safely extract a string from Express params (Express 5 returns string | string[])
 */
export const paramStr = (val: string | string[] | undefined): string => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};

import { z } from 'zod';

const optionalNumber = () => z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().int().nonnegative().optional());

const requiredPositiveNumber = () => z.preprocess((value) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().int().positive());

export const createPropertySchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(500),
  propertyType: z.string(),
  category: z.string().default('Residential'),
  availableFor: z.string().default('Anyone'),
  dependency: z.string().default('Independent'),
  rent: requiredPositiveNumber(),
  deposit: optionalNumber().default(0),
  negotiable: z.string().default('FIXED'),
  maintenanceExtra: z.boolean().default(false),
  maintenanceAmount: optionalNumber(),
  minimumStay: z.string().default('NO_MINIMUM'),
  availableFrom: z.string().optional().transform((s) => s ? new Date(s) : new Date()),
  furnishing: z.string().default('Semi Furnished'),
  amenities: z.array(z.string()).default([]),
  specialRules: z.string().max(500).optional(),
  address: z.string().trim().min(3),
  area: z.string().optional().default(''),
  city: z.string().min(1),
  pincode: z.string().optional().default('000000'),
  lat: z.preprocess((value) => value === '' || value === undefined ? 23.2599 : Number(value), z.number().min(-90).max(90)).optional().default(23.2599),
  lng: z.preprocess((value) => value === '' || value === undefined ? 77.4126 : Number(value), z.number().min(-180).max(180)).optional().default(77.4126),
  nearLandmark: z.string().optional(),
  photos: z.array(z.string()).default([]),
  videoTourUrl: z.string().url().optional().or(z.literal('')),
  status: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  availableFor: z.string().optional(),
  furnishing: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  amenities: z.string().optional(), // comma-separated
  verified: z.string().optional(),
  negotiable: z.string().optional(),
  search: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  status: z.string().optional(),
});

export const inquirySchema = z.object({
  message: z.string().max(500).optional(),
});

export const alertSchema = z.object({
  city: z.string().min(1),
  area: z.string().optional(),
  budgetMin: optionalNumber(),
  budgetMax: optionalNumber(),
  propertyType: z.string().optional(),
  availableFor: z.string().optional(),
  furnishing: z.string().optional(),
});

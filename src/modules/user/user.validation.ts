import { z } from 'zod';

export const profileSetupSchema = z.object({
  profilePhoto: z.string().optional(),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  area: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  profilePhoto: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().optional(),
  area: z.string().optional(),
});

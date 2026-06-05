import { z } from 'zod';

export const createRoommateProfileSchema = z.object({
  photo: z.string().optional().default('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop'),
  age: z.number().int().min(16).max(80),
  gender: z.string(),
  profession: z.string(),
  collegeName: z.string().optional(),
  companyName: z.string().optional(),
  food: z.string(),
  smoking: z.string(),
  drinking: z.string(),
  sleep: z.string(),
  personality: z.string(),
  petFriendly: z.boolean().default(false),
  cleanliness: z.string(),
  guests: z.string(),
  noise: z.string(),
  budgetMin: z.number().int().nonnegative(),
  budgetMax: z.number().int().positive(),
  preferredAreas: z.array(z.string()).default([]),
  moveInDate: z.string().transform((s) => new Date(s)).optional(),
  duration: z.string().optional(),
  roomPreferences: z.array(z.string()).default([]),
  preferredGender: z.string().default('ANY'),
  bio: z.string().max(500).optional().default('Looking for a great roommate!'),
  hasRoom: z.boolean().default(false),
  roomAddress: z.string().optional(),
  roomArea: z.string().optional(),
  rentPerPerson: z.number().int().optional(),
  occupants: z.number().int().optional(),
  roomPhotos: z.array(z.string()).default([]),
  roomAmenities: z.array(z.string()).default([]),
  city: z.string().min(1),
  area: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const updateRoommateProfileSchema = createRoommateProfileSchema.partial();

export const interestSchema = z.object({
  message: z.string().max(200).optional(),
});

import prisma from '../../config/database';
import { createGeoPoint } from '../../utils/geo.util';

export const setupProfile = async (userId: string, data: {
  name: string;
  email?: string;
  profilePhoto?: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  interests: string[];
}) => {
  const location = data.lat && data.lng ? createGeoPoint(data.lat, data.lng) : undefined;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email || undefined,
      profilePhoto: data.profilePhoto || undefined,
      city: data.city,
      area: data.area || undefined,
      location: location || undefined,
      interests: data.interests,
      isProfileComplete: true,
    },
  });

  return sanitizeUser(user);
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          properties: true,
          reviews: true,
          referrals: true,
        },
      },
    },
  });

  if (!user) throw { statusCode: 404, message: 'User not found' };
  return { ...sanitizeUser(user), _count: (user as any)._count };
};

export const updateProfile = async (userId: string, data: {
  name?: string;
  email?: string;
  profilePhoto?: string;
  city?: string;
  area?: string;
  interests?: string[];
}) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.profilePhoto && { profilePhoto: data.profilePhoto }),
      ...(data.city && { city: data.city }),
      ...(data.area !== undefined && { area: data.area }),
      ...(data.interests && { interests: data.interests }),
    },
  });

  return sanitizeUser(user);
};

export const updateLocation = async (userId: string, lat: number, lng: number, city?: string, area?: string) => {
  const location = createGeoPoint(lat, lng);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      location,
      ...(city && { city }),
      ...(area !== undefined && { area }),
    },
  });

  return sanitizeUser(user);
};

export const updateLanguage = async (userId: string, language: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { language: language === 'hi' ? 'hi' : 'en' },
  });

  return sanitizeUser(user);
};

export const getPublicProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      city: true,
      area: true,
      isPhoneVerified: true,
      createdAt: true,
      _count: {
        select: { properties: true, reviews: true },
      },
    },
  });

  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

export const getUserStats = async (userId: string) => {
  const [properties, savedProperties, roommateProfile, reviews] = await Promise.all([
    prisma.property.count({ where: { ownerId: userId, isDeleted: false } }),
    prisma.propertySaved.count({ where: { userId } }),
    prisma.roommateProfile.findUnique({ where: { userId }, select: { id: true } }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    propertiesListed: properties,
    savedProperties,
    hasRoommateProfile: !!roommateProfile,
    reviewsGiven: reviews,
  };
};

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  profilePhoto: user.profilePhoto,
  role: user.role,
  isPhoneVerified: user.isPhoneVerified,
  isEmailVerified: user.isEmailVerified,
  isProfileComplete: user.isProfileComplete,
  city: user.city,
  area: user.area,
  interests: user.interests,
  language: user.language,
  referralCode: user.referralCode,
  createdAt: user.createdAt,
});

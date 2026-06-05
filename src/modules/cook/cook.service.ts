import prisma from '../../config/database';
import { createGeoPoint } from '../../utils/geo.util';
import { generateSlug } from '../../utils/slug.util';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { notifyUsersInArea } from '../notification/notification.service';

export const registerCook = async (userId: string, data: any) => {
  const existing = await prisma.cookProfile.findUnique({ where: { userId } });
  if (existing) throw { statusCode: 409, message: 'Cook profile already exists' };
  const slug = generateSlug(data.fullName);
  const location = data.lat && data.lng ? createGeoPoint(data.lat, data.lng) : undefined;

  const cook = await prisma.cookProfile.create({
    data: {
      userId, fullName: data.fullName, photo: data.photo, gender: data.gender,
      age: data.age, experience: data.experience, speciality: data.speciality,
      cuisineTypes: data.cuisineTypes || [], serviceTypes: data.serviceTypes || [],
      pricePerVisit: data.pricePerVisit, monthlyOneMeal: data.monthlyOneMeal,
      monthlyTwoMeals: data.monthlyTwoMeals, serviceAreas: data.serviceAreas || [],
      city: data.city, pincode: data.pincode, location,
      availableSlots: data.availableSlots || [], slug,
    },
  });

  await notifyUsersInArea({
    city: cook.city,
    excludedUserId: userId,
    interestKeys: ['FIND_COOK'],
    type: 'SERVICE_LAUNCHED',
    title: `New cook available in ${cook.city}`,
    body: `${cook.fullName} has started accepting bookings near you.`,
    metadata: { cookId: cook.id, slug: cook.slug, city: cook.city },
  });

  return cook;
};

export const updateCook = async (cookId: string, userId: string, data: any) => {
  const cook = await prisma.cookProfile.findFirst({ where: { id: cookId, userId } });
  if (!cook) throw { statusCode: 404, message: 'cook.not_found' };
  const updateData: any = { ...data };
  if (data.lat && data.lng) { updateData.location = createGeoPoint(data.lat, data.lng); delete updateData.lat; delete updateData.lng; }
  return prisma.cookProfile.update({ where: { id: cookId }, data: updateData });
};

export const deleteCook = async (cookId: string, userId: string) => {
  const cook = await prisma.cookProfile.findFirst({ where: { id: cookId, userId } });
  if (!cook) throw { statusCode: 404, message: 'cook.not_found' };
  return prisma.cookProfile.update({ where: { id: cookId }, data: { isDeleted: true, isActive: false } });
};

export const browseCooks = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { isActive: true, isDeleted: false };
  if (query.city) where.city = query.city;
  if (query.speciality) where.speciality = query.speciality;
  if (query.cuisine) where.cuisineTypes = { has: query.cuisine };
  if (query.serviceType) where.serviceTypes = { has: query.serviceType };
  if (query.gender) where.gender = query.gender;
  if (query.priceMax) where.pricePerVisit = { lte: parseInt(query.priceMax) };
  if (query.experienceMin) where.experience = { gte: parseInt(query.experienceMin) };

  let orderBy: any = { createdAt: 'desc' };
  if (query.sort === 'price') orderBy = { pricePerVisit: query.order === 'desc' ? 'desc' : 'asc' };
  if (query.sort === 'experience') orderBy = { experience: 'desc' };
  if (query.sort === 'viewCount') orderBy = { viewCount: 'desc' };

  const [cooks, total] = await Promise.all([
    prisma.cookProfile.findMany({ where, orderBy, skip, take: limit,
      include: { user: { select: { id: true, name: true } }, _count: { select: { savedBy: true, reviews: true } } } }),
    prisma.cookProfile.count({ where }),
  ]);
  return { cooks, meta: buildPaginationMeta(page, limit, total) };
};

export const getCookById = async (idOrSlug: string) => {
  const where: any = idOrSlug.length === 24 ? { id: idOrSlug, isDeleted: false } : { slug: idOrSlug, isDeleted: false };
  const cook = await prisma.cookProfile.findFirst({ where,
    include: { user: { select: { id: true, name: true, phone: true, profilePhoto: true } },
      _count: { select: { savedBy: true, reviews: true } } } });
  if (!cook) throw { statusCode: 404, message: 'cook.not_found' };
  await prisma.cookProfile.update({ where: { id: cook.id }, data: { viewCount: { increment: 1 } } });
  return cook;
};

export const toggleSave = async (cookId: string, userId: string) => {
  const existing = await prisma.cookSaved.findUnique({ where: { cookId_userId: { cookId, userId } } });
  if (existing) { await prisma.cookSaved.delete({ where: { id: existing.id } }); return { saved: false }; }
  await prisma.cookSaved.create({ data: { cookId, userId } });
  return { saved: true };
};

export const getSaved = async (userId: string) => {
  const saved = await prisma.cookSaved.findMany({ where: { userId }, include: { cook: true }, orderBy: { createdAt: 'desc' } });
  return saved.map((s) => s.cook);
};

export const getDashboard = async (userId: string) => {
  const cook = await prisma.cookProfile.findUnique({ where: { userId },
    include: { _count: { select: { savedBy: true, reviews: true } } } });
  if (!cook) throw { statusCode: 404, message: 'cook.not_found' };
  
  return {
    views: cook.viewCount || 0,
    rating: (cook as any).rating || 0,
    saves: cook._count?.savedBy || 0,
    bookings: 0, // Placeholder for future bookings feature
    cook: cook
  };
};

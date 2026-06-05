import prisma from '../../config/database';
import { createGeoPoint } from '../../utils/geo.util';
import { generateSlug } from '../../utils/slug.util';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { notifyUsersInArea } from '../notification/notification.service';

const hasCoordinates = (data: any) => Number.isFinite(Number(data.lat)) && Number.isFinite(Number(data.lng));

const buildManualLocation = (data: any) => ({
  type: 'manual',
  city: data.city,
  area: data.area || '',
  address: data.address || '',
  pincode: data.pincode || '',
});

export const registerMess = async (ownerId: string, data: any) => {
  const existing = await prisma.messProfile.findUnique({ where: { ownerId } });
  if (existing) throw { statusCode: 409, message: 'You already have a mess listing' };

  const slug = generateSlug(data.name);
  const location = hasCoordinates(data)
    ? createGeoPoint(Number(data.lat), Number(data.lng))
    : data.location || buildManualLocation(data);

  const mess = await prisma.messProfile.create({
    data: {
      ownerId, name: data.name, ownerName: data.ownerName, description: data.description,
      photos: data.photos || [], address: data.address, area: data.area, city: data.city,
      pincode: data.pincode, location, foodType: data.foodType, mealTypes: data.mealTypes || [],
      timings: data.timings || {}, pricePerMeal: data.pricePerMeal, monthlyOneMeal: data.monthlyOneMeal,
      monthlyTwoMeals: data.monthlyTwoMeals, monthlyThreeMeals: data.monthlyThreeMeals,
      trialMealPrice: data.trialMealPrice, deliveryAvailable: data.deliveryAvailable || false,
      deliveryRadius: data.deliveryRadius, tiffinService: data.tiffinService || false,
      seatingCapacity: data.seatingCapacity, features: data.features || [], slug,
    },
  });

  await notifyUsersInArea({
    city: mess.city,
    area: mess.area,
    excludedUserId: ownerId,
    interestKeys: ['FIND_MESS'],
    type: 'SERVICE_LAUNCHED',
    title: `New mess listed in ${mess.area || mess.city}`,
    body: `${mess.name} is now available nearby.`,
    metadata: { messId: mess.id, slug: mess.slug, city: mess.city, area: mess.area },
  });

  return mess;
};

export const updateMess = async (messId: string, ownerId: string, data: any) => {
  const mess = await prisma.messProfile.findFirst({ where: { id: messId, ownerId } });
  if (!mess) throw { statusCode: 404, message: 'mess.not_found' };
  const updateData: any = { ...data };
  if (data.lat && data.lng) { updateData.location = createGeoPoint(data.lat, data.lng); delete updateData.lat; delete updateData.lng; }
  return prisma.messProfile.update({ where: { id: messId }, data: updateData });
};

export const deleteMess = async (messId: string, ownerId: string) => {
  const mess = await prisma.messProfile.findFirst({ where: { id: messId, ownerId } });
  if (!mess) throw { statusCode: 404, message: 'mess.not_found' };
  return prisma.messProfile.update({ where: { id: messId }, data: { isDeleted: true, isActive: false } });
};

export const browseMessListings = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { isActive: true, isDeleted: false };
  if (query.city) where.city = query.city;
  if (query.area) where.area = query.area;
  if (query.foodType) where.foodType = query.foodType;
  if (query.delivery === 'true') where.deliveryAvailable = true;
  if (query.tiffin === 'true') where.tiffinService = true;
  if (query.mealType) where.mealTypes = { has: query.mealType };
  if (query.priceMax) where.pricePerMeal = { lte: parseInt(query.priceMax) };
  if (query.features) where.features = { hasEvery: query.features.split(',') };

  let orderBy: any = { createdAt: 'desc' };
  if (query.sort === 'price') orderBy = { pricePerMeal: query.order === 'desc' ? 'desc' : 'asc' };
  if (query.sort === 'viewCount') orderBy = { viewCount: 'desc' };

  const [listings, total] = await Promise.all([
    prisma.messProfile.findMany({ where, orderBy, skip, take: limit,
      include: { owner: { select: { id: true, name: true } }, _count: { select: { savedBy: true, reviews: true } } },
    }),
    prisma.messProfile.count({ where }),
  ]);
  return { listings, meta: buildPaginationMeta(page, limit, total) };
};

export const getMessById = async (idOrSlug: string) => {
  const where: any = idOrSlug.length === 24 ? { id: idOrSlug, isDeleted: false } : { slug: idOrSlug, isDeleted: false };
  const mess = await prisma.messProfile.findFirst({ where,
    include: { owner: { select: { id: true, name: true, phone: true, profilePhoto: true } },
      _count: { select: { savedBy: true, reviews: true } } },
  });
  if (!mess) throw { statusCode: 404, message: 'mess.not_found' };
  await prisma.messProfile.update({ where: { id: mess.id }, data: { viewCount: { increment: 1 } } });
  return mess;
};

export const updateMenu = async (ownerId: string, data: { date: string; mealType: string; items: string[]; photo?: string }) => {
  const mess = await prisma.messProfile.findUnique({ where: { ownerId } });
  if (!mess) throw { statusCode: 404, message: 'mess.not_found' };
  const date = new Date(data.date); date.setHours(0,0,0,0);
  return prisma.messMenu.upsert({
    where: { messId_date_mealType: { messId: mess.id, date, mealType: data.mealType as any } },
    create: { messId: mess.id, date, mealType: data.mealType as any, items: data.items, photo: data.photo },
    update: { items: data.items, photo: data.photo },
  });
};

export const getMenu = async (messId: string, date?: string) => {
  const d = date ? new Date(date) : new Date(); d.setHours(0,0,0,0);
  return prisma.messMenu.findMany({ where: { messId, date: d }, orderBy: { mealType: 'asc' } });
};

export const toggleSave = async (messId: string, userId: string) => {
  const existing = await prisma.messSaved.findUnique({ where: { messId_userId: { messId, userId } } });
  if (existing) { await prisma.messSaved.delete({ where: { id: existing.id } }); return { saved: false }; }
  await prisma.messSaved.create({ data: { messId, userId } });
  return { saved: true };
};

export const getSaved = async (userId: string) => {
  const saved = await prisma.messSaved.findMany({ where: { userId },
    include: { mess: true }, orderBy: { createdAt: 'desc' } });
  return saved.map((s) => s.mess);
};

export const getDashboard = async (ownerId: string) => {
  const mess = await prisma.messProfile.findUnique({ where: { ownerId },
    include: { _count: { select: { savedBy: true, reviews: true } } } });
  if (!mess) throw { statusCode: 404, message: 'mess.not_found' };
  const todayMenus = await getMenu(mess.id);
  return { mess, todayMenus };
};

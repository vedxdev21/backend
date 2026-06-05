import prisma from '../../config/database';
import { createGeoPoint } from '../../utils/geo.util';
import { generateSlug } from '../../utils/slug.util';
import { parsePagination, buildPaginationMeta, parseSortOrder } from '../../utils/pagination.util';
import { Prisma } from '@prisma/client';
import { notifyUsersInArea } from '../notification/notification.service';

// Maps from friendly frontend values to Prisma enum values
const PROPERTY_TYPE_MAP: Record<string, string> = {
  '1RK': 'ONE_RK', '1BHK': 'ONE_BHK', '2BHK': 'TWO_BHK', '3BHK': 'THREE_BHK',
  '4BHK+': 'THREE_BHK', 'PG': 'PG', 'Hostel': 'HOSTEL_BOYS', 'Flat': 'TWO_BHK',
  'Studio': 'ONE_RK', 'Penthouse': 'DUPLEX', 'Villa': 'DUPLEX',
  'Independent House': 'SINGLE_ROOM_INDEPENDENT', 'Shop': 'SHOP', 'Office': 'OFFICE',
  'Warehouse': 'GODOWN',
};

const CATEGORY_MAP: Record<string, string> = {
  'Residential': 'RESIDENTIAL', 'Student': 'STUDENT', 'Commercial': 'COMMERCIAL',
};

const AVAILABLE_FOR_MAP: Record<string, string> = {
  'Boys': 'BOYS_ONLY', 'Girls': 'GIRLS_ONLY', 'Family': 'FAMILY_ONLY',
  'Couples': 'BOTH', 'Working Professionals': 'WORKING_PROFESSIONALS',
  'Students': 'STUDENTS_ONLY', 'Anyone': 'ANY', 'Company': 'ANY',
};

const FURNISHING_MAP: Record<string, string> = {
  'Fully Furnished': 'FURNISHED', 'Semi Furnished': 'SEMI_FURNISHED', 'Unfurnished': 'UNFURNISHED',
};

const NEGOTIABLE_MAP: Record<string, string> = {
  'Fixed': 'FIXED', 'Slightly': 'SLIGHTLY_NEGOTIABLE', 'Negotiable': 'NEGOTIABLE',
};

const MINIMUM_STAY_MAP: Record<string, string> = {
  '1 Month': 'NO_MINIMUM', '3 Months': 'THREE_MONTHS', '6 Months': 'SIX_MONTHS',
  '11 Months': 'ELEVEN_MONTHS', '1 Year+': 'ONE_YEAR_PLUS', 'NO_MINIMUM': 'NO_MINIMUM',
};

function mapEnum(value: string | undefined, map: Record<string, string>, fallback: string): string {
  if (!value) return fallback;
  return map[value] || value; // try map first, fallback to raw value (might already be enum)
}

export const createProperty = async (ownerId: string, data: any) => {
  const slug = generateSlug(data.title);
  const lat = data.lat || 23.2599;
  const lng = data.lng || 77.4126;
  const location = createGeoPoint(lat, lng);

  const requestedStatus = typeof data.status === 'string' ? data.status.toUpperCase() : '';
  const status = requestedStatus === 'DRAFT' ? 'DRAFT' : 'PENDING';

  const property = await prisma.property.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description || 'No description provided',
      propertyType: mapEnum(data.propertyType, PROPERTY_TYPE_MAP, 'TWO_BHK') as any,
      category: mapEnum(data.category, CATEGORY_MAP, 'RESIDENTIAL') as any,
      availableFor: mapEnum(data.availableFor, AVAILABLE_FOR_MAP, 'ANY') as any,
      dependency: data.dependency || 'Independent',
      rent: data.rent,
      deposit: data.deposit || 0,
      negotiable: mapEnum(data.negotiable, NEGOTIABLE_MAP, 'FIXED') as any,
      maintenanceExtra: data.maintenanceExtra || false,
      maintenanceAmount: data.maintenanceAmount,
      minimumStay: mapEnum(data.minimumStay, MINIMUM_STAY_MAP, 'NO_MINIMUM') as any,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : new Date(),
      furnishing: mapEnum(data.furnishing, FURNISHING_MAP, 'SEMI_FURNISHED') as any,
      amenities: data.amenities || [],
      specialRules: data.specialRules,
      address: data.address,
      area: data.area || '',
      city: data.city,
      pincode: data.pincode || '000000',
      location,
      nearLandmark: data.nearLandmark,
      photos: data.photos?.length ? data.photos : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
      videoTourUrl: data.videoTourUrl,
      slug,
      status: status as any,
    },
    include: { owner: { select: { id: true, name: true, profilePhoto: true, phone: true } } },
  });

  return property;
};

const getMatchingPropertyAlertUserIds = async (property: {
  city: string;
  area?: string | null;
  rent: number;
  propertyType: string;
  availableFor: string;
  furnishing: string;
}) => {
  const alerts = await prisma.propertyAlert.findMany({
    where: {
      city: property.city,
      isActive: true,
      ...(property.area ? { OR: [{ area: property.area }, { area: null }, { area: '' }] } : {}),
    },
    select: {
      userId: true,
      budgetMin: true,
      budgetMax: true,
      propertyType: true,
      availableFor: true,
      furnishing: true,
    },
  });

  return alerts
    .filter((alert) => {
      if (alert.budgetMin !== null && alert.budgetMin !== undefined && property.rent < alert.budgetMin) return false;
      if (alert.budgetMax !== null && alert.budgetMax !== undefined && property.rent > alert.budgetMax) return false;
      if (alert.propertyType && alert.propertyType !== property.propertyType) return false;
      if (alert.availableFor && alert.availableFor !== property.availableFor) return false;
      if (alert.furnishing && alert.furnishing !== property.furnishing) return false;
      return true;
    })
    .map((alert) => alert.userId);
};

export const browseProperties = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);

  // Handle sort mapping from frontend
  let orderBy: any = { createdAt: 'desc' };
  if (query.sort === 'newest' || query.sort === 'createdAt') orderBy = { createdAt: 'desc' };
  else if (query.sort === 'price_asc' || query.sort === 'rent') orderBy = { rent: query.order === 'desc' ? 'desc' : 'asc' };
  else if (query.sort === 'price_desc') orderBy = { rent: 'desc' };
  else if (query.sort === 'popular' || query.sort === 'viewCount') orderBy = { viewCount: 'desc' };

  const where: any = {
    isDeleted: false,
  };

  // Only add status filter if explicitly provided
  if (query.status) where.status = query.status;

  if (query.city) where.city = query.city;
  if (query.area) where.area = query.area;
  if (query.type) {
    const mapped = mapEnum(query.type, PROPERTY_TYPE_MAP, '');
    if (mapped) where.propertyType = mapped;
  }
  if (query.category) where.category = mapEnum(query.category, CATEGORY_MAP, query.category);
  if (query.availableFor) where.availableFor = mapEnum(query.availableFor, AVAILABLE_FOR_MAP, query.availableFor);
  if (query.furnishing) where.furnishing = mapEnum(query.furnishing, FURNISHING_MAP, query.furnishing);
  if (query.verified === 'true') where.isVerified = true;
  if (query.negotiable === 'true') where.negotiable = { not: 'FIXED' };

  if (query.budgetMin || query.budgetMax) {
    where.rent = {};
    if (query.budgetMin) where.rent.gte = parseInt(query.budgetMin);
    if (query.budgetMax) where.rent.lte = parseInt(query.budgetMax);
  }

  if (query.amenities) {
    const amenityList = query.amenities.split(',');
    where.amenities = { hasEvery: amenityList };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { area: { contains: query.search, mode: 'insensitive' } },
      { nearLandmark: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, profilePhoto: true, isPhoneVerified: true } },
        _count: { select: { savedBy: true, reviews: true, inquiries: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, meta: buildPaginationMeta(page, limit, total) };
};

export const getPropertyById = async (idOrSlug: string) => {
  const where: any = idOrSlug.length === 24
    ? { id: idOrSlug, isDeleted: false }
    : { slug: idOrSlug, isDeleted: false };

  const property = await prisma.property.findFirst({
    where,
    include: {
      owner: { select: { id: true, name: true, profilePhoto: true, phone: true, isPhoneVerified: true, createdAt: true } },
      _count: { select: { savedBy: true, reviews: true, inquiries: true, numberViews: true } },
    },
  });

  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  // Increment view count
  await prisma.property.update({ where: { id: property.id }, data: { viewCount: { increment: 1 } } });

  return property;
};

export const updateProperty = async (propertyId: string, ownerId: string, data: any) => {
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId } });
  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  const updateData: any = { ...data };
  if (data.lat && data.lng) {
    updateData.location = createGeoPoint(data.lat, data.lng);
    delete updateData.lat;
    delete updateData.lng;
  }

  return prisma.property.update({ where: { id: propertyId }, data: updateData });
};

export const deleteProperty = async (propertyId: string, ownerId: string) => {
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId } });
  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  return prisma.property.update({ where: { id: propertyId }, data: { isDeleted: true, status: 'DELETED' } });
};

export const updatePropertyStatus = async (propertyId: string, ownerId: string, status: string) => {
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId } });
  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  return prisma.property.update({ where: { id: propertyId }, data: { status: status as any } });
};

export const getMyListings = async (ownerId: string, status?: string) => {
  const where: any = { ownerId, isDeleted: false };
  if (status) where.status = status;

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { savedBy: true, inquiries: true, numberViews: true } } },
  });
};

export const toggleSave = async (propertyId: string, userId: string) => {
  const existing = await prisma.propertySaved.findUnique({
    where: { propertyId_userId: { propertyId, userId } },
  });

  if (existing) {
    await prisma.propertySaved.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.propertySaved.create({ data: { propertyId, userId } });
  return { saved: true };
};

export const getSavedProperties = async (userId: string) => {
  const saved = await prisma.propertySaved.findMany({
    where: { userId },
    include: {
      property: {
        include: { owner: { select: { id: true, name: true, profilePhoto: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return saved.map((s) => s.property);
};

export const sendInquiry = async (propertyId: string, userId: string, message?: string) => {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  return prisma.propertyInquiry.create({
    data: { propertyId, userId, message },
  });
};

export const getInquiries = async (propertyId: string, ownerId: string) => {
  const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId } });
  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  return prisma.propertyInquiry.findMany({
    where: { propertyId },
    include: { user: { select: { id: true, name: true, phone: true, profilePhoto: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const showNumber = async (propertyId: string, viewerId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { owner: { select: { phone: true, name: true } } },
  });

  if (!property) throw { statusCode: 404, message: 'property.not_found' };

  // Track the view
  await prisma.propertyNumberView.upsert({
    where: { propertyId_viewerId: { propertyId, viewerId } },
    create: { propertyId, viewerId },
    update: { viewedAt: new Date() },
  });

  return { phone: property.owner.phone, name: property.owner.name };
};

export const compareProperties = async (ids: string[]) => {
  return prisma.property.findMany({
    where: { id: { in: ids }, isDeleted: false },
    include: { owner: { select: { id: true, name: true } } },
  });
};

export const createAlert = async (userId: string, data: any) => {
  return prisma.propertyAlert.create({
    data: { userId, ...data },
  });
};

export const getAlerts = async (userId: string) => {
  return prisma.propertyAlert.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteAlert = async (alertId: string, userId: string) => {
  const alert = await prisma.propertyAlert.findFirst({ where: { id: alertId, userId } });
  if (!alert) throw { statusCode: 404, message: 'Alert not found' };

  return prisma.propertyAlert.delete({ where: { id: alertId } });
};

export const getOwnerDashboard = async (ownerId: string) => {
  const [listings, totalViews, totalInquiries, pendingInquiries, recentInquiries] = await Promise.all([
    prisma.property.count({ where: { ownerId, isDeleted: false } }),
    prisma.property.aggregate({ where: { ownerId, isDeleted: false }, _sum: { viewCount: true } }),
    prisma.propertyInquiry.count({ where: { property: { ownerId } } }),
    prisma.propertyInquiry.count({ where: { property: { ownerId }, isRead: false } }),
    prisma.propertyInquiry.findMany({
      where: { property: { ownerId } },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    stats: {
      totalListings: listings,
      totalViews: totalViews._sum.viewCount || 0,
      totalInquiries,
      pendingInquiries,
    },
    recentInquiries,
  };
};

export const notifyAreaUsersForApprovedProperty = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      ownerId: true,
      title: true,
      city: true,
      area: true,
      rent: true,
      propertyType: true,
      availableFor: true,
      furnishing: true,
      slug: true,
    },
  });

  if (!property) return { sent: 0 };

  const additionalUserIds = await getMatchingPropertyAlertUserIds(property);

  return notifyUsersInArea({
    city: property.city,
    area: property.area,
    excludedUserId: property.ownerId,
    additionalUserIds,
    interestKeys: ['FIND_ROOM'],
    type: 'PROPERTY_ALERT_MATCH',
    title: `New property listed in ${property.area || property.city}`,
    body: `${property.title} is now live${property.rent ? ` for Rs ${property.rent}/month` : ''}.`,
    metadata: {
      propertyId: property.id,
      slug: property.slug,
      city: property.city,
      area: property.area,
    },
  });
};

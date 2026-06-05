import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { generateTokenPair } from '../../utils/jwt.util';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { JwtUserPayload } from '../../types/common.types';
import { notifyAreaUsersForApprovedProperty } from '../property/property.service';

export const adminLogin = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({ where: { email, role: 'ADMIN' } });
  if (!user || !user.passwordHash) throw { statusCode: 401, message: 'Invalid admin credentials' };
  const match = await comparePassword(password, user.passwordHash);
  if (!match) throw { statusCode: 401, message: 'Invalid admin credentials' };
  const payload: JwtUserPayload = { id: user.id, phone: user.phone, role: user.role, name: user.name };
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...generateTokenPair(payload) };
};

export const getDashboard = async () => {
  const [users, properties, mess, cooks, roommates, pendingReports, comingSoonSignups] = await Promise.all([
    prisma.user.count(),
    prisma.property.count({ where: { isDeleted: false } }),
    prisma.messProfile.count({ where: { isDeleted: false } }),
    prisma.cookProfile.count({ where: { isDeleted: false } }),
    prisma.roommateProfile.count({ where: { isDeleted: false } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.comingSoonSignup.count(),
  ]);
  return { stats: { users, properties, mess, cooks, roommates, pendingReports, comingSoonSignups } };
};

// ---- Users Management ----
export const getUsers = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.search) { where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }, { phone: { contains: query.search } }, { email: { contains: query.search, mode: 'insensitive' } }]; }
  if (query.role) where.role = query.role;
  if (query.blocked === 'true') where.isBlocked = true;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      select: { id: true, name: true, phone: true, email: true, role: true, isBlocked: true, isPhoneVerified: true, city: true, createdAt: true } }),
    prisma.user.count({ where }),
  ]);
  return { users, meta: buildPaginationMeta(page, limit, total) };
};

export const getUserDetail = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId },
    include: { _count: { select: { properties: true, reviews: true, reports: true } } } });
  if (!user) throw { statusCode: 404, message: 'User not found' };
  const { passwordHash, refreshToken, otpCode, ...safe } = user;
  return safe;
};

export const verifyUser = async (userId: string) => prisma.user.update({ where: { id: userId }, data: { isPhoneVerified: true } });
export const blockUser = async (userId: string, block: boolean) => prisma.user.update({ where: { id: userId }, data: { isBlocked: block } });
export const deleteUser = async (userId: string) => prisma.user.delete({ where: { id: userId } });

// ---- Properties Management ----
export const getProperties = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { isDeleted: false };
  if (query.status) where.status = query.status;
  if (query.city) where.city = query.city;
  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { owner: { select: { id: true, name: true, phone: true } } } }),
    prisma.property.count({ where }),
  ]);
  return { properties, meta: buildPaginationMeta(page, limit, total) };
};

export const approveProperty = async (id: string) => {
  const property = await prisma.property.update({ where: { id }, data: { status: 'ACTIVE', isVerified: true } });
  await notifyAreaUsersForApprovedProperty(id);
  return property;
};
export const rejectProperty = async (id: string) => prisma.property.update({ where: { id }, data: { status: 'REJECTED' } });
export const featureProperty = async (id: string, featured: boolean) => prisma.property.update({ where: { id }, data: { isFeatured: featured } });
export const deleteProperty = async (id: string) => prisma.property.update({ where: { id }, data: { isDeleted: true, status: 'DELETED' } });

// ---- Mess Management ----
export const getMessListings = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const [listings, total] = await Promise.all([
    prisma.messProfile.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { owner: { select: { id: true, name: true } } } }),
    prisma.messProfile.count({ where: { isDeleted: false } }),
  ]);
  return { listings, meta: buildPaginationMeta(page, limit, total) };
};
export const verifyMess = async (id: string) => prisma.messProfile.update({ where: { id }, data: { isVerified: true } });
export const deleteMess = async (id: string) => prisma.messProfile.update({ where: { id }, data: { isDeleted: true } });

// ---- Cooks Management ----
export const getCooks = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const [cooks, total] = await Promise.all([
    prisma.cookProfile.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { user: { select: { id: true, name: true } } } }),
    prisma.cookProfile.count({ where: { isDeleted: false } }),
  ]);
  return { cooks, meta: buildPaginationMeta(page, limit, total) };
};
export const verifyCook = async (id: string) => prisma.cookProfile.update({ where: { id }, data: { isVerified: true } });
export const deleteCook = async (id: string) => prisma.cookProfile.update({ where: { id }, data: { isDeleted: true } });

// ---- Reviews / Reports Management ----
export const getReviews = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { user: { select: { id: true, name: true } } } }),
    prisma.review.count(),
  ]);
  return { reviews, meta: buildPaginationMeta(page, limit, total) };
};
export const hideReview = async (id: string) => prisma.review.update({ where: { id }, data: { isHidden: true } });
export const featureReview = async (id: string) => prisma.review.update({ where: { id }, data: { isFeatured: true } });
export const deleteReview = async (id: string) => prisma.review.delete({ where: { id } });

export const getReports = async (query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.status) where.status = query.status;
  const [reports, total] = await Promise.all([
    prisma.report.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { reporter: { select: { id: true, name: true } } } }),
    prisma.report.count({ where }),
  ]);
  return { reports, meta: buildPaginationMeta(page, limit, total) };
};
export const updateReport = async (id: string, data: { status: string; adminNote?: string }) => {
  return prisma.report.update({ where: { id }, data: { status: data.status as any, adminNote: data.adminNote } });
};

// ---- Notifications / Analytics / Settings ----
export const sendNotification = async (data: { userId?: string; title: string; body: string; type?: string }) => {
  if (data.userId) {
    return prisma.notification.create({ data: { userId: data.userId, type: 'ADMIN_ANNOUNCEMENT', title: data.title, body: data.body } });
  }
  // Broadcast to all users
  const users = await prisma.user.findMany({ select: { id: true } });
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, type: 'ADMIN_ANNOUNCEMENT' as any, title: data.title, body: data.body })),
  });
  return { sent: users.length };
};

export const getAnalytics = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [newUsers, newProperties, newMess, newCooks, topCities] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.property.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.messProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.cookProfile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.property.groupBy({ by: ['city'], _count: true, orderBy: { _count: { city: 'desc' } }, take: 10 }),
  ]);
  return { last30Days: { newUsers, newProperties, newMess, newCooks }, topCities };
};

export const getComingSoonStats = async () => {
  return prisma.comingSoonSignup.groupBy({ by: ['service'], _count: true, orderBy: { _count: { service: 'desc' } } });
};

export const getSettings = async () => prisma.adminSetting.findMany();
export const updateSettings = async (key: string, value: any) => {
  return prisma.adminSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
};

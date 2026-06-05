import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { sendEmail } from '../../utils/mail.util';

const SERVICE_INTEREST_COPY: Record<string, string> = {
  FIND_ROOM: 'property',
  FIND_MESS: 'mess',
  FIND_COOK: 'cook',
  FIND_ROOMMATE: 'roommate',
};

export const getNotifications = async (userId: string, query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { userId };
  if (query.type) where.type = query.type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, meta: buildPaginationMeta(page, limit, total) };
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { isRead: true } });
};

export const markAllRead = async (userId: string) => {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
};

export const createNotification = async (data: {
  userId: string; type: string; title: string; body: string; data?: any;
}) => {
  return prisma.notification.create({
    data: { userId: data.userId, type: data.type as any, title: data.title, body: data.body, data: data.data },
  });
};

export const notifyUsersInArea = async (data: {
  city: string;
  area?: string | null;
  excludedUserId?: string;
  title: string;
  body: string;
  type: string;
  metadata?: any;
  additionalUserIds?: string[];
  interestKeys?: string[];
}) => {
  const nearbyUsers = await prisma.user.findMany({
    where: {
      city: data.city,
      isBlocked: false,
      ...(data.interestKeys?.length ? { interests: { hasSome: data.interestKeys } } : {}),
      ...(data.excludedUserId ? { id: { not: data.excludedUserId } } : {}),
      ...(data.area
        ? {
            OR: [
              { area: data.area },
              { area: null },
              { area: '' },
            ],
          }
        : {}),
    },
    select: { id: true, email: true, name: true, interests: true },
  });

  const targetIds = new Set([
    ...nearbyUsers.map((user) => user.id),
    ...(data.additionalUserIds || []),
  ]);

  if (data.excludedUserId) {
    targetIds.delete(data.excludedUserId);
  }

  if (!targetIds.size) return { sent: 0 };

  const recipients = await prisma.user.findMany({
    where: { id: { in: Array.from(targetIds) } },
    select: { id: true, email: true, name: true, interests: true },
  });
  const usersById = new Map(recipients.map((user) => [user.id, user]));

  await prisma.notification.createMany({
    data: Array.from(targetIds).map((userId) => ({
      userId,
      type: data.type as any,
      title: data.title,
      body: data.body,
      data: data.metadata,
    })),
  });

  const interestSummary = data.interestKeys?.map((key) => SERVICE_INTEREST_COPY[key]).filter(Boolean).join(', ');

  await Promise.allSettled(
    Array.from(targetIds).map(async (userId) => {
      const user = usersById.get(userId);
      if (!user?.email) return;

      const areaLine = data.area ? `${data.area}, ${data.city}` : data.city;
      const intro = interestSummary ? `You asked for ${interestSummary} updates in your area.` : 'A new update is available in your area.';

      await sendEmail({
        to: user.email,
        subject: data.title,
        text: `${intro}\n\n${data.body}\n\nArea: ${areaLine}\n\nOpen ${data.city} on ${data.metadata?.slug ? `${data.metadata.slug}` : 'MasterX'} for more details.`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <h2 style="margin-bottom: 8px;">${data.title}</h2>
            <p>${intro}</p>
            <p>${data.body}</p>
            <p><strong>Area:</strong> ${areaLine}</p>
          </div>
        `,
      });
    })
  );

  return { sent: targetIds.size };
};

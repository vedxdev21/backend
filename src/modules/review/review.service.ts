import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';

export const getReviews = async (targetType: string, targetId: string, query: any) => {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { targetType: targetType.toUpperCase(), targetId, isHidden: false };

  const [reviews, total, avgResult] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit,
      include: { user: { select: { id: true, name: true, profilePhoto: true } } } }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true }, _count: true }),
  ]);

  // Rating distribution
  const distribution = await Promise.all(
    [1, 2, 3, 4, 5].map(async (rating) => ({
      rating, count: await prisma.review.count({ where: { ...where, rating } }),
    }))
  );

  return {
    reviews,
    meta: buildPaginationMeta(page, limit, total),
    stats: { average: Math.round((avgResult._avg.rating || 0) * 10) / 10, total: avgResult._count, distribution },
  };
};

export const createReview = async (userId: string, data: {
  targetType: string; targetId: string; rating: number; comment?: string; photos?: string[];
}) => {
  // Build polymorphic relation fields
  const relationData: any = {};
  switch (data.targetType.toUpperCase()) {
    case 'PROPERTY': relationData.propertyId = data.targetId; break;
    case 'MESS': relationData.messId = data.targetId; break;
    case 'COOK': relationData.cookId = data.targetId; break;
  }

  return prisma.review.create({
    data: {
      userId, targetType: data.targetType.toUpperCase() as any, targetId: data.targetId,
      rating: data.rating, comment: data.comment, photos: data.photos || [], ...relationData,
    },
    include: { user: { select: { id: true, name: true, profilePhoto: true } } },
  });
};

export const updateReview = async (reviewId: string, userId: string, data: { rating?: number; comment?: string; photos?: string[] }) => {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw { statusCode: 404, message: 'Review not found' };
  return prisma.review.update({ where: { id: reviewId }, data });
};

export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) throw { statusCode: 404, message: 'Review not found' };
  return prisma.review.delete({ where: { id: reviewId } });
};

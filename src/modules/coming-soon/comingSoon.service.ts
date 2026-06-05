import prisma from '../../config/database';
import { COMING_SOON_SERVICES } from '../../config/constants';

export const getAllServices = async () => {
  const services = await Promise.all(
    Object.entries(COMING_SOON_SERVICES).map(async ([key, info]) => {
      const count = await prisma.comingSoonSignup.count({ where: { service: key as any } });
      return { id: key, ...info, signupCount: count };
    })
  );
  return services;
};

export const getServiceDetail = async (serviceId: string) => {
  const key = serviceId.toUpperCase() as keyof typeof COMING_SOON_SERVICES;
  const info = COMING_SOON_SERVICES[key];
  if (!info) throw { statusCode: 404, message: 'Service not found' };

  const count = await prisma.comingSoonSignup.count({ where: { service: key as any } });
  return { id: key, ...info, signupCount: count };
};

export const notifyMe = async (serviceId: string, data: { phone?: string; email?: string; city?: string; userId?: string }) => {
  const key = serviceId.toUpperCase();
  if (!COMING_SOON_SERVICES[key as keyof typeof COMING_SOON_SERVICES]) {
    throw { statusCode: 404, message: 'Service not found' };
  }

  if (data.phone) {
    const existing = await prisma.comingSoonSignup.findUnique({
      where: { service_phone: { service: key as any, phone: data.phone } },
    });
    if (existing) throw { statusCode: 409, message: 'coming_soon.already_signed' };
  }

  return prisma.comingSoonSignup.create({
    data: {
      service: key as any,
      phone: data.phone,
      email: data.email,
      city: data.city,
      userId: data.userId,
    },
  });
};

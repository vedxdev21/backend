import prisma from '../../config/database';
import { createGeoPoint } from '../../utils/geo.util';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { ROOMMATE_MATCH_WEIGHTS } from '../../config/constants';
import { notifyUsersInArea } from '../notification/notification.service';

export const createProfile = async (userId: string, data: any) => {
  const existing = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (existing) throw { statusCode: 409, message: 'Roommate profile already exists' };

  const location = data.lat && data.lng ? createGeoPoint(data.lat, data.lng) : undefined;

  // Map frontend values to backend enums
  const professionMap: any = { 'WORKING_PROFESSIONAL': 'WORKING' };
  const drinkingMap: any = { 'YES': 'REGULAR', 'OCCASIONALLY': 'OCCASIONAL' };
  const cleanlinessMap: any = { 'RELAXED': 'FLEXIBLE' };
  const guestsMap: any = { 'NO_GUESTS': 'NOT_OKAY', 'OFTEN': 'OKAY' };
  const noiseMap: any = { 'QUIET': 'PREFER_QUIET', 'LOUD_OK': 'OKAY' };
  const smokingMap: any = { 'OCCASIONALLY': 'YES' };

  const profile = await prisma.roommateProfile.create({
    data: {
      userId,
      photo: data.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
      age: data.age,
      gender: data.gender as any,
      profession: (professionMap[data.profession] || data.profession) as any,
      collegeName: data.collegeName,
      companyName: data.companyName,
      food: data.food as any,
      smoking: (smokingMap[data.smoking] || data.smoking) as any,
      drinking: (drinkingMap[data.drinking] || data.drinking) as any,
      sleep: data.sleep as any,
      personality: data.personality as any,
      petFriendly: data.petFriendly || false,
      cleanliness: (cleanlinessMap[data.cleanliness] || data.cleanliness) as any,
      guests: (guestsMap[data.guests] || data.guests) as any,
      noise: (noiseMap[data.noise] || data.noise) as any,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      preferredAreas: data.preferredAreas || [],
      moveInDate: data.moveInDate,
      duration: data.duration as any,
      roomPreferences: data.roomPreferences || [],
      preferredGender: (data.preferredGender || 'ANY') as any,
      bio: data.bio || 'Looking for a great roommate!',
      hasRoom: data.hasRoom || false,
      roomAddress: data.roomAddress,
      roomArea: data.roomArea,
      rentPerPerson: data.rentPerPerson,
      occupants: data.occupants,
      roomPhotos: data.roomPhotos || [],
      roomAmenities: data.roomAmenities || [],
      city: data.city,
      area: data.area,
      location,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  await notifyUsersInArea({
    city: profile.city,
    area: profile.area,
    excludedUserId: userId,
    interestKeys: ['FIND_ROOMMATE'],
    type: 'SERVICE_LAUNCHED',
    title: `New roommate profile in ${profile.area || profile.city}`,
    body: `${profile.user?.name || 'A user'} is now looking for a roommate nearby.`,
    metadata: { roommateProfileId: profile.id, city: profile.city, area: profile.area },
  });

  return profile;
};

export const updateProfile = async (userId: string, data: any) => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw { statusCode: 404, message: 'Roommate profile not found' };

  const updateData: any = { ...data };
  if (data.lat && data.lng) {
    updateData.location = createGeoPoint(data.lat, data.lng);
    delete updateData.lat;
    delete updateData.lng;
  }

  return prisma.roommateProfile.update({ where: { userId }, data: updateData });
};

export const deleteProfile = async (userId: string) => {
  return prisma.roommateProfile.update({
    where: { userId },
    data: { isDeleted: true, isActive: false },
  });
};

export const browseProfiles = async (currentUserId: string | null, query: any) => {
  const { page, limit, skip } = parsePagination(query);

  let currentProfile = null;
  if (currentUserId) {
    currentProfile = await prisma.roommateProfile.findUnique({ where: { userId: currentUserId } });
  }

  const where: any = {
    isActive: true,
    isDeleted: false,
  };
  
  if (currentUserId) {
    where.userId = { not: currentUserId };
  }

  if (query.city) where.city = query.city;
  if (query.gender) where.gender = query.gender;
  if (query.profession) where.profession = query.profession;
  if (query.hasRoom === 'true') where.hasRoom = true;
  if (query.food) where.food = query.food;
  if (query.smoking) where.smoking = query.smoking;

  if (query.budgetMin || query.budgetMax) {
    where.budgetMax = {};
    if (query.budgetMin) where.budgetMin = { lte: parseInt(query.budgetMax || '999999') };
    if (query.budgetMax) where.budgetMax = { gte: parseInt(query.budgetMin || '0') };
  }

  const [profiles, total] = await Promise.all([
    prisma.roommateProfile.findMany({
      where,
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.roommateProfile.count({ where }),
  ]);

  // Calculate compatibility for each profile if current user has a profile
  const profilesWithScore = profiles.map((profile) => ({
    ...profile,
    compatibility: currentProfile ? calculateCompatibility(currentProfile, profile) : null,
  }));

  // Sort by compatibility if requested and possible
  if (query.sort === 'compatibility' && currentProfile) {
    profilesWithScore.sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));
  }

  return { profiles: profilesWithScore, meta: buildPaginationMeta(page, limit, total) };
};

export const getProfileById = async (profileId: string, currentUserId?: string) => {
  const profile = await prisma.roommateProfile.findFirst({
    where: { id: profileId, isActive: true, isDeleted: false },
    include: { user: { select: { id: true, name: true, profilePhoto: true, createdAt: true } } },
  });

  if (!profile) throw { statusCode: 404, message: 'Profile not found' };

  await prisma.roommateProfile.update({ where: { id: profileId }, data: { viewCount: { increment: 1 } } });

  let compatibility = null;
  if (currentUserId) {
    const currentProfile = await prisma.roommateProfile.findUnique({ where: { userId: currentUserId } });
    if (currentProfile) {
      compatibility = calculateCompatibility(currentProfile, profile);
    }
  }

  return { ...profile, compatibility };
};

// ===== Interest System =====

export const sendInterest = async (senderId: string, receiverId: string, message?: string) => {
  const senderProfile = await prisma.roommateProfile.findUnique({ where: { userId: senderId } });
  if (!senderProfile) throw { statusCode: 400, message: 'Create your profile first' };

  const receiverProfile = await prisma.roommateProfile.findFirst({ where: { id: receiverId } });
  if (!receiverProfile) throw { statusCode: 404, message: 'Profile not found' };

  const existing = await prisma.roommateInterest.findUnique({
    where: { senderId_receiverId: { senderId: senderProfile.id, receiverId } },
  });
  if (existing) throw { statusCode: 409, message: 'roommate.already_sent' };

  return prisma.roommateInterest.create({
    data: { senderId: senderProfile.id, receiverId, message },
  });
};

export const respondToInterest = async (interestId: string, userId: string, status: 'ACCEPTED' | 'DECLINED') => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw { statusCode: 400, message: 'Profile not found' };

  const interest = await prisma.roommateInterest.findFirst({
    where: { id: interestId, receiverId: profile.id },
  });
  if (!interest) throw { statusCode: 404, message: 'Interest not found' };

  return prisma.roommateInterest.update({
    where: { id: interestId },
    data: { status },
  });
};

export const getInterests = async (userId: string) => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw { statusCode: 400, message: 'Create your profile first' };

  const [sent, received] = await Promise.all([
    prisma.roommateInterest.findMany({
      where: { senderId: profile.id },
      include: {
        receiver: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.roommateInterest.findMany({
      where: { receiverId: profile.id },
      include: {
        sender: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { sent, received };
};

export const getConnections = async (userId: string) => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const connections = await prisma.roommateInterest.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ senderId: profile.id }, { receiverId: profile.id }],
    },
    include: {
      sender: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
      receiver: { include: { user: { select: { id: true, name: true, profilePhoto: true } } } },
    },
  });

  return connections;
};

// ===== Groups =====

export const createGroup = async (userId: string, data: { name: string; description?: string; city: string; area?: string }) => {
  return prisma.roommateGroup.create({
    data: { ...data, createdById: userId },
  });
};

export const browseGroups = async (query: any) => {
  const where: any = {};
  if (query.city) where.city = query.city;

  return prisma.roommateGroup.findMany({
    where,
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const joinGroup = async (groupId: string, userId: string) => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw { statusCode: 400, message: 'Create your profile first' };

  const group = await prisma.roommateGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });
  if (!group) throw { statusCode: 404, message: 'Group not found' };
  if ((group as any)._count.members >= group.maxMembers) throw { statusCode: 400, message: 'Group is full' };

  return prisma.roommateGroupMember.create({
    data: { groupId, profileId: profile.id },
  });
};

export const leaveGroup = async (groupId: string, userId: string) => {
  const profile = await prisma.roommateProfile.findUnique({ where: { userId } });
  if (!profile) throw { statusCode: 400, message: 'Profile not found' };

  return prisma.roommateGroupMember.delete({
    where: { groupId_profileId: { groupId, profileId: profile.id } },
  });
};

// ===== Matching Algorithm =====

function calculateCompatibility(profileA: any, profileB: any) {
  let score = 0;
  const breakdown: Record<string, { match: boolean; weight: number }> = {};

  // Food (15%)
  const foodMatch = profileA.food === profileB.food || profileA.food === 'BOTH' || profileB.food === 'BOTH';
  breakdown.food = { match: foodMatch, weight: ROOMMATE_MATCH_WEIGHTS.food };
  if (foodMatch) score += ROOMMATE_MATCH_WEIGHTS.food;

  // Smoking (15%)
  const smokingMatch = profileA.smoking === profileB.smoking;
  breakdown.smoking = { match: smokingMatch, weight: ROOMMATE_MATCH_WEIGHTS.smoking };
  if (smokingMatch) score += ROOMMATE_MATCH_WEIGHTS.smoking;

  // Drinking (10%)
  const drinkingMatch = profileA.drinking === profileB.drinking;
  breakdown.drinking = { match: drinkingMatch, weight: ROOMMATE_MATCH_WEIGHTS.drinking };
  if (drinkingMatch) score += ROOMMATE_MATCH_WEIGHTS.drinking;

  // Sleep (10%)
  const sleepMatch = profileA.sleep === profileB.sleep;
  breakdown.sleep = { match: sleepMatch, weight: ROOMMATE_MATCH_WEIGHTS.sleep };
  if (sleepMatch) score += ROOMMATE_MATCH_WEIGHTS.sleep;

  // Personality (5%)
  const personalityMatch = profileA.personality === profileB.personality || profileA.personality === 'AMBIVERT' || profileB.personality === 'AMBIVERT';
  breakdown.personality = { match: personalityMatch, weight: ROOMMATE_MATCH_WEIGHTS.personality };
  if (personalityMatch) score += ROOMMATE_MATCH_WEIGHTS.personality;

  // Cleanliness (10%)
  const cleanMatch = profileA.cleanliness === profileB.cleanliness || profileA.cleanliness === 'FLEXIBLE' || profileB.cleanliness === 'FLEXIBLE';
  breakdown.cleanliness = { match: cleanMatch, weight: ROOMMATE_MATCH_WEIGHTS.cleanliness };
  if (cleanMatch) score += ROOMMATE_MATCH_WEIGHTS.cleanliness;

  // Budget overlap (15%)
  const budgetOverlap = Math.max(0, Math.min(profileA.budgetMax, profileB.budgetMax) - Math.max(profileA.budgetMin, profileB.budgetMin));
  const budgetRange = Math.max(profileA.budgetMax - profileA.budgetMin, profileB.budgetMax - profileB.budgetMin, 1);
  const budgetScore = Math.min(1, budgetOverlap / budgetRange);
  const budgetMatch = budgetScore > 0.3;
  breakdown.budget = { match: budgetMatch, weight: ROOMMATE_MATCH_WEIGHTS.budget };
  score += ROOMMATE_MATCH_WEIGHTS.budget * budgetScore;

  // Location (10%)
  const locationMatch = profileA.city === profileB.city;
  const sameArea = profileA.area && profileB.area && profileA.area === profileB.area;
  breakdown.location = { match: locationMatch, weight: ROOMMATE_MATCH_WEIGHTS.location };
  if (sameArea) score += ROOMMATE_MATCH_WEIGHTS.location;
  else if (locationMatch) score += ROOMMATE_MATCH_WEIGHTS.location * 0.5;

  // Profession (5%)
  const profMatch = profileA.profession === profileB.profession;
  breakdown.profession = { match: profMatch, weight: ROOMMATE_MATCH_WEIGHTS.profession };
  if (profMatch) score += ROOMMATE_MATCH_WEIGHTS.profession;

  // Gender preference (5%)
  const genderOk =
    (profileA.preferredGender === 'ANY' || profileA.preferredGender === 'SAME' && profileA.gender === profileB.gender) &&
    (profileB.preferredGender === 'ANY' || profileB.preferredGender === 'SAME' && profileB.gender === profileA.gender);
  breakdown.genderPref = { match: genderOk, weight: ROOMMATE_MATCH_WEIGHTS.genderPref };
  if (genderOk) score += ROOMMATE_MATCH_WEIGHTS.genderPref;

  const roundedScore = Math.round(score);
  let label = 'Fair Match';
  if (roundedScore >= 80) label = 'Great Match';
  else if (roundedScore >= 60) label = 'Good Match';

  return { score: roundedScore, label, breakdown };
}

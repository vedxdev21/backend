import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding DUMMY data...');

  const dummyPassword = await bcrypt.hash('password123', 12);

  // 1. Create Dummy User
  const user = await prisma.user.upsert({
    where: { phone: '+918888888888' },
    update: {},
    create: {
      name: 'Dummy User',
      phone: '+918888888888',
      email: 'dummy@projectx.in',
      passwordHash: dummyPassword,
      role: 'USER',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      city: 'Bhopal',
      area: 'MP Nagar',
    },
  });

  // 2. Dummy Properties
  const propCount = await prisma.property.count();
  if (propCount === 0) {
    await prisma.property.createMany({
      data: [
        {
          ownerId: user.id,
          title: 'Spacious 2BHK in MP Nagar Zone-1',
          description: 'Beautifully furnished 2BHK apartment with balcony, near DB Mall.',
          propertyType: 'TWO_BHK',
          category: 'RESIDENTIAL',
          availableFor: 'ANY',
          dependency: 'INDEPENDENT',
          rent: 15000,
          deposit: 30000,
          negotiable: 'NEGOTIABLE',
          furnishing: 'FURNISHED',
          amenities: ['wifi', 'ac', 'parking', 'water', 'security', 'geyser', 'balcony'],
          address: 'Plot 45, Zone-1',
          city: 'Bhopal',
          area: 'MP Nagar Zone-1',
          pincode: '462011',
          photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400'],
          status: 'ACTIVE',
          slug: 'spacious-2bhk-mp-nagar-1',
          availableFrom: new Date(),
          location: { type: 'Point', coordinates: [77.4326, 23.2332] }
        },
        {
          ownerId: user.id,
          title: 'Affordable PG for Boys in Arera Colony',
          description: 'Clean and hygienic PG with meals.',
          propertyType: 'PG',
          category: 'STUDENT',
          availableFor: 'BOYS_ONLY',
          dependency: 'DEPENDENT',
          rent: 5500,
          deposit: 5500,
          negotiable: 'FIXED',
          furnishing: 'FURNISHED',
          amenities: ['wifi', 'laundry', 'water', 'kitchen'],
          address: 'E-5, Arera Colony',
          city: 'Bhopal',
          area: 'Arera Colony',
          pincode: '462016',
          photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400'],
          status: 'ACTIVE',
          slug: 'affordable-pg-boys-arera',
          availableFrom: new Date(),
          location: { type: 'Point', coordinates: [77.4326, 23.2332] }
        }
      ]
    });
    console.log('✅ Dummy properties created');
  }

  // 3. Dummy Roommates
  const rmCount = await prisma.roommateProfile.count();
  if (rmCount === 0) {
    await prisma.roommateProfile.create({
      data: {
        userId: user.id,
        gender: 'MALE',
        profession: 'WORKING',
        city: 'Bhopal',
        area: 'MP Nagar',
        budgetMin: 5000,
        budgetMax: 10000,
        food: 'VEG',
        sleep: 'EARLY_BIRD',
        personality: 'AMBIVERT',
        cleanliness: 'VERY_CLEAN',
        guests: 'SOMETIMES',
        noise: 'PREFER_QUIET',
        smoking: 'NO',
        drinking: 'NO',
        hasRoom: true,
        bio: 'Software engineer at TCS. Looking for a clean and quiet roommate.',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200',
        age: 26,
      }
    });
    console.log('✅ Dummy roommates created');
  }

  // 4. Dummy Mess
  const messCount = await prisma.messProfile.count();
  if (messCount === 0) {
    await prisma.messProfile.create({
      data: {
        ownerId: user.id,
        name: 'Shree Bhojanalaya',
        ownerName: 'Shree Owner',
        description: 'Pure vegetarian mess serving authentic North Indian thali.',
        foodType: 'VEG',
        city: 'Bhopal',
        area: 'MP Nagar Zone-1',
        address: 'Shop 12, Zone-1',
        pincode: '462011',
        monthlyOneMeal: 1800,
        monthlyTwoMeals: 3200,
        monthlyThreeMeals: 4200,
        deliveryAvailable: true,
        tiffinService: true,
        photos: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400'],
        slug: 'shree-bhojanalaya-mp-nagar-1',
        location: { type: 'Point', coordinates: [77.4326, 23.2332] },
        timings: { breakfast: '8-10 AM', lunch: '12-3 PM', dinner: '7-10 PM' }
      }
    });
    console.log('✅ Dummy mess created');
  }

  // 5. Dummy Cooks
  const cookCount = await prisma.cookProfile.count();
  if (cookCount === 0) {
    await prisma.cookProfile.create({
      data: {
        userId: user.id,
        fullName: 'Ram K',
        gender: 'MALE',
        age: 35,
        experience: 8,
        speciality: 'VEG',
        cuisineTypes: ['North Indian', 'South Indian'],
        city: 'Bhopal',
        pincode: '462011',
        serviceAreas: ['MP Nagar Area'],
        monthlyOneMeal: 2000,
        monthlyTwoMeals: 4000,
        photo: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200',
        slug: 'ram-k-mp-nagar-1',
        availableSlots: { morning: true, evening: true }
      }
    });
    console.log('✅ Dummy cook created');
  }

  console.log('🎉 Dummy Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

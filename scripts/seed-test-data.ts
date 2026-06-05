import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Image URLs from public sources for testing
const messImageUrls = [
  'https://images.unsplash.com/photo-1504674900967-77ff41de766b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1541123603104-852db7d0bc91?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
];

const propertyImageUrls = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1494145904049-0dca7b0589b0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9b721ef60afa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565193566173-7cde4f40a87b?w=800&h=600&fit=crop',
];

const profilePhotoUrls = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507623514645-b1cda52078e1?w=400&h=400&fit=crop',
];

async function main() {
  console.log('🌱 Seeding test data...\n');

  // 1. Create Test Users
  console.log('📱 Creating test users...');
  const users = [];
  
  const messOwnerPassword = await bcrypt.hash('mess123456', 12);
  const messOwner = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      name: 'Rajesh Mess Owner',
      phone: '+919876543210',
      email: 'rajesh.mess@projectx.in',
      passwordHash: messOwnerPassword,
      role: 'MESS_OWNER',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      isEmailVerified: true,
      isProfileComplete: true,
      city: 'Bhopal',
      area: 'MP Nagar',
      profilePhoto: profilePhotoUrls[0],
      referralCode: 'MESS001',
    },
  });
  users.push(messOwner);
  console.log(`✅ Mess owner: ${messOwner.name} (${messOwner.phone})`);

  const propertyOwnerPassword = await bcrypt.hash('owner123456', 12);
  const propertyOwner = await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {},
    create: {
      name: 'Priya Property Owner',
      phone: '+919876543211',
      email: 'priya.owner@projectx.in',
      passwordHash: propertyOwnerPassword,
      role: 'OWNER',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      isEmailVerified: true,
      isProfileComplete: true,
      city: 'Bhopal',
      area: 'New Market',
      profilePhoto: profilePhotoUrls[1],
      referralCode: 'OWNER001',
    },
  });
  users.push(propertyOwner);
  console.log(`✅ Property owner: ${propertyOwner.name} (${propertyOwner.phone})`);

  const cookPassword = await bcrypt.hash('cook123456', 12);
  const cookUser = await prisma.user.upsert({
    where: { phone: '+919876543212' },
    update: {},
    create: {
      name: 'Vikram Cook Provider',
      phone: '+919876543212',
      email: 'vikram.cook@projectx.in',
      passwordHash: cookPassword,
      role: 'COOK_PROVIDER',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      isEmailVerified: true,
      isProfileComplete: true,
      city: 'Bhopal',
      area: 'Hoshangabad Road',
      profilePhoto: profilePhotoUrls[2],
      referralCode: 'COOK001',
    },
  });
  users.push(cookUser);
  console.log(`✅ Cook provider: ${cookUser.name} (${cookUser.phone})`);

  const regularUserPassword = await bcrypt.hash('user123456', 12);
  const regularUser = await prisma.user.upsert({
    where: { phone: '+919876543213' },
    update: {},
    create: {
      name: 'Amit Student',
      phone: '+919876543213',
      email: 'amit.student@projectx.in',
      passwordHash: regularUserPassword,
      role: 'USER',
      authProvider: 'PHONE',
      isPhoneVerified: true,
      isEmailVerified: true,
      isProfileComplete: true,
      city: 'Bhopal',
      area: 'Arera Colony',
      profilePhoto: profilePhotoUrls[3],
      referralCode: 'USER001',
    },
  });
  users.push(regularUser);
  console.log(`✅ Regular user: ${regularUser.name} (${regularUser.phone})`);

  // 2. Create Properties
  console.log('\n🏠 Creating properties...');
  const properties = [];

  const property1 = await prisma.property.create({
    data: {
      ownerId: propertyOwner.id,
      title: 'Spacious 2-BHK in MP Nagar',
      description: 'Beautiful 2-bedroom apartment with modern amenities, parking, and security',
      propertyType: 'TWO_BHK',
      category: 'RESIDENTIAL',
      availableFor: 'BOYS_ONLY',
      dependency: 'Independent',
      rent: 15000,
      deposit: 45000,
      furnishing: 'SEMI_FURNISHED',
      amenities: ['WiFi', 'Parking', '24/7 Security', 'Lift', 'Gym', 'Common Area'],
      address: '123, ABC Street, MP Nagar, Bhopal',
      area: 'MP Nagar',
      city: 'Bhopal',
      pincode: '462010',
      location: { lat: 23.1943, lng: 79.5941 },
      photos: [propertyImageUrls[0], propertyImageUrls[1]],
      status: 'ACTIVE',
      isVerified: true,
      slug: 'spacious-2bhk-mp-nagar',
      availableFrom: new Date('2026-05-01'),
    },
  });
  properties.push(property1);
  console.log(`✅ Property created: ${property1.title}`);

  const property2 = await prisma.property.create({
    data: {
      ownerId: propertyOwner.id,
      title: '1-RK Studio Apartment',
      description: 'Compact and cozy studio near college campus, fully furnished',
      propertyType: 'ONE_RK',
      category: 'STUDENT',
      availableFor: 'GIRLS_ONLY',
      dependency: 'Independent',
      rent: 8000,
      deposit: 24000,
      furnishing: 'FURNISHED',
      amenities: ['WiFi', 'Water Supply', 'Power Backup', 'Common Kitchen'],
      address: '456, Campus Road, Arera Colony, Bhopal',
      area: 'Arera Colony',
      city: 'Bhopal',
      pincode: '462039',
      location: { lat: 23.2015, lng: 79.5885 },
      photos: [propertyImageUrls[2], propertyImageUrls[3]],
      status: 'ACTIVE',
      isVerified: true,
      slug: '1rk-studio-arera-colony',
      availableFrom: new Date('2026-04-25'),
    },
  });
  properties.push(property2);
  console.log(`✅ Property created: ${property2.title}`);

  // 3. Create Mess Profiles
  console.log('\n🍽️  Creating mess profiles...');
  const messes = [];

  const mess1 = await prisma.messProfile.create({
    data: {
      ownerId: messOwner.id,
      name: 'Rajesh Mess & Tiffin Service',
      ownerName: 'Rajesh Kumar',
      description: 'Best quality home-cooked North Indian food. 20+ years of experience. Home delivery available.',
      photos: [messImageUrls[0], messImageUrls[1], messImageUrls[2]],
      address: '789, Main Street, MP Nagar, Bhopal',
      area: 'MP Nagar',
      city: 'Bhopal',
      pincode: '462010',
      location: { lat: 23.1943, lng: 79.5941 },
      foodType: 'VEG',
      mealTypes: ['BREAKFAST', 'LUNCH', 'DINNER'],
      timings: {
        breakfast: { start: '07:00', end: '09:30' },
        lunch: { start: '12:00', end: '14:00' },
        dinner: { start: '19:00', end: '21:00' },
      },
      pricePerMeal: 80,
      monthlyOneMeal: 1800,
      monthlyTwoMeals: 3400,
      monthlyThreeMeals: 4800,
      trialMealPrice: 50,
      deliveryAvailable: true,
      deliveryRadius: 5,
      seatingCapacity: 50,
      features: ['Hygienic Kitchen', 'Fresh Vegetables', 'No Artificial Colors', 'Home Delivery', 'Flexible Plans'],
      isVerified: true,
      isFeatured: true,
      slug: 'rajesh-mess-mp-nagar',
    },
  });
  messes.push(mess1);
  console.log(`✅ Mess created: ${mess1.name}`);

  const mess2 = await prisma.messProfile.create({
    data: {
      ownerId: messOwner.id,
      name: 'South Indian Tiffin House',
      ownerName: 'Vikram Singh',
      description: 'Authentic South Indian food - Dosa, Idli, Sambar. Perfect for students and professionals.',
      photos: [messImageUrls[3], messImageUrls[4], messImageUrls[5]],
      address: '321, Temple Road, Hoshangabad Road, Bhopal',
      area: 'Hoshangabad Road',
      city: 'Bhopal',
      pincode: '462026',
      location: { lat: 23.1823, lng: 79.5665 },
      foodType: 'BOTH',
      mealTypes: ['BREAKFAST', 'LUNCH'],
      timings: {
        breakfast: { start: '06:30', end: '09:00' },
        lunch: { start: '11:30', end: '14:30' },
      },
      pricePerMeal: 100,
      monthlyOneMeal: 2000,
      monthlyTwoMeals: 3800,
      trialMealPrice: 60,
      deliveryAvailable: true,
      deliveryRadius: 3,
      seatingCapacity: 30,
      features: ['Authentic Recipe', 'Spice Control Option', 'Vegan Options', 'Quick Service'],
      isVerified: true,
      isFeatured: false,
      slug: 'south-indian-tiffin-house',
    },
  });
  messes.push(mess2);
  console.log(`✅ Mess created: ${mess2.name}`);

  // 4. Create Mess Menus
  console.log('\n📋 Creating mess menus...');
  const today = new Date();
  
  await prisma.messMenu.create({
    data: {
      messId: mess1.id,
      date: today,
      mealType: 'BREAKFAST',
      items: ['Aloo Paratha', 'Butter', 'Pickles', 'Tea/Coffee', 'Milk'],
      photo: messImageUrls[0],
    },
  });

  await prisma.messMenu.create({
    data: {
      messId: mess1.id,
      date: today,
      mealType: 'LUNCH',
      items: ['Rice', 'Dal Makhani', 'Paneer Butter Masala', 'Naan', 'Salad'],
      photo: messImageUrls[1],
    },
  });

  await prisma.messMenu.create({
    data: {
      messId: mess1.id,
      date: today,
      mealType: 'DINNER',
      items: ['Roti', 'Chole Bhature', 'Onion Salad', 'Pickle', 'Yogurt'],
      photo: messImageUrls[2],
    },
  });

  await prisma.messMenu.create({
    data: {
      messId: mess2.id,
      date: today,
      mealType: 'BREAKFAST',
      items: ['Masala Dosa', 'Coconut Chutney', 'Sambar', 'Tea'],
      photo: messImageUrls[3],
    },
  });

  console.log('✅ Mess menus created');

  // 5. Create Cook Profiles
  console.log('\n👨‍🍳 Creating cook profiles...');
  const cook1 = await prisma.cookProfile.create({
    data: {
      userId: cookUser.id,
      fullName: 'Vikram Singh',
      photo: profilePhotoUrls[2],
      gender: 'MALE',
      age: 35,
      experience: 12,
      speciality: 'NON_VEG',
      cuisineTypes: ['North Indian', 'Mughlai', 'Chinese'],
      serviceTypes: ['DAILY_COOK', 'ONE_TIME_VISIT'],
      pricePerVisit: 1500,
      monthlyOneMeal: 25000,
      monthlyTwoMeals: 45000,
      serviceAreas: ['MP Nagar', 'Hoshangabad Road', 'Arera Colony'],
      city: 'Bhopal',
      pincode: '462026',
      location: { lat: 23.1823, lng: 79.5665 },
      availableSlots: {
        monday: ['09:00-11:00', '15:00-17:00'],
        tuesday: ['09:00-11:00', '15:00-17:00'],
        wednesday: ['09:00-11:00', '15:00-17:00'],
        thursday: ['09:00-11:00', '15:00-17:00'],
        friday: ['09:00-11:00', '15:00-17:00'],
        saturday: ['10:00-12:00'],
      },
      isVerified: true,
      isFeatured: true,
      slug: 'vikram-singh-cook',
    },
  });
  console.log(`✅ Cook profile created: ${cook1.fullName}`);

  // 6. Create Property Inquiries
  console.log('\n💬 Creating property inquiries...');
  await prisma.propertyInquiry.create({
    data: {
      propertyId: property1.id,
      userId: regularUser.id,
      message: 'Is the property available from May 1st? Also, can we do a video tour?',
    },
  });

  await prisma.propertyInquiry.create({
    data: {
      propertyId: property2.id,
      userId: regularUser.id,
      message: 'Perfect for students. When can I visit?',
    },
  });
  console.log('✅ Property inquiries created');

  // 7. Create Saved Items
  console.log('\n❤️  Creating saved items...');
  await prisma.propertySaved.create({
    data: {
      propertyId: property1.id,
      userId: regularUser.id,
    },
  });

  await prisma.messProfile.update({
    where: { id: mess1.id },
    data: {
      savedBy: {
        create: {
          userId: regularUser.id,
        },
      },
    },
  });

  await prisma.cookProfile.update({
    where: { id: cook1.id },
    data: {
      savedBy: {
        create: {
          userId: regularUser.id,
        },
      },
    },
  });
  console.log('✅ Saved items created');

  // 8. Create Notifications
  console.log('\n🔔 Creating notifications...');
  await prisma.notification.create({
    data: {
      userId: regularUser.id,
      type: 'PROPERTY_INQUIRY',
      title: 'New Property Available',
      body: 'A new 2-BHK property matching your criteria is now available in MP Nagar!',
      data: { propertyId: property1.id },
    },
  });

  await prisma.notification.create({
    data: {
      userId: regularUser.id,
      type: 'MESS_INQUIRY',
      title: 'Mess Alert',
      body: 'Rajesh Mess has a new veg menu available!',
      data: { messId: mess1.id },
    },
  });
  console.log('✅ Notifications created');

  // 9. Create Reviews
  console.log('\n⭐ Creating reviews...');
  await prisma.review.create({
    data: {
      userId: regularUser.id,
      targetType: 'PROPERTY',
      targetId: property1.id,
      propertyId: property1.id,
      rating: 5,
      comment: 'Excellent property! Very clean, good location, and helpful owner. Highly recommended!',
      photos: [propertyImageUrls[0]],
      isFeatured: true,
    },
  });

  await prisma.review.create({
    data: {
      userId: regularUser.id,
      targetType: 'MESS',
      targetId: mess1.id,
      messId: mess1.id,
      rating: 4,
      comment: 'Great food quality and variety. Timely delivery. Would rate 5 stars if delivery was faster.',
      photos: [messImageUrls[0]],
    },
  });

  await prisma.review.create({
    data: {
      userId: regularUser.id,
      targetType: 'COOK',
      targetId: cook1.id,
      cookId: cook1.id,
      rating: 5,
      comment: 'Vikram is a professional cook with excellent skills. Food was delicious!',
      photos: [profilePhotoUrls[2]],
      isFeatured: true,
    },
  });
  console.log('✅ Reviews created');

  // 10. Create Reports
  console.log('\n⚠️  Creating reports...');
  await prisma.report.create({
    data: {
      reporterId: regularUser.id,
      targetType: 'PROPERTY',
      targetId: property1.id,
      reason: 'Misleading photos',
      description: 'Photos do not match actual property condition',
      status: 'PENDING',
    },
  });
  console.log('✅ Reports created');

  // 11. Create Roommate Profiles
  console.log('\n👥 Creating roommate profiles...');
  const roommateProfile = await prisma.roommateProfile.create({
    data: {
      userId: regularUser.id,
      photo: profilePhotoUrls[3],
      age: 22,
      gender: 'MALE',
      profession: 'STUDENT',
      collegeName: 'MITS Gwalior',
      food: 'BOTH',
      smoking: 'NO',
      drinking: 'NO',
      sleep: 'EARLY_BIRD',
      personality: 'INTROVERT',
      cleanliness: 'VERY_CLEAN',
      guests: 'OKAY',
      noise: 'PREFER_QUIET',
      budgetMin: 5000,
      budgetMax: 12000,
      preferredAreas: ['MP Nagar', 'Arera Colony', 'Hoshangabad Road'],
      moveInDate: new Date('2026-05-15'),
      duration: 'ONE_YEAR_PLUS',
      roomPreferences: ['Attached Bathroom', 'WiFi', 'Quiet Area'],
      bio: 'College student looking for clean, peaceful room. Non-smoker.',
      city: 'Bhopal',
      area: 'Arera Colony',
      isActive: true,
      isVerified: true,
    },
  });
  console.log(`✅ Roommate profile created: ${roommateProfile.id}`);

  console.log('\n✨ Test data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Properties: ${properties.length}`);
  console.log(`   Messes: ${messes.length}`);
  console.log(`   Cook Profiles: 1`);
  console.log(`   Mess Menus: 4`);
  console.log(`   Property Inquiries: 2`);
  console.log(`   Saved Items: 3`);
  console.log(`   Notifications: 2`);
  console.log(`   Reviews: 3`);
  console.log(`   Reports: 1`);
  console.log(`   Roommate Profiles: 1`);
  
  console.log('\n🔐 Test Credentials:');
  console.log('   Mess Owner: +919876543210 / mess123456');
  console.log('   Property Owner: +919876543211 / owner123456');
  console.log('   Cook Provider: +919876543212 / cook123456');
  console.log('   Regular User: +919876543213 / user123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

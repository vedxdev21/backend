import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Create or Force-Update Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@projectx.in';
  const adminPhone = '+919999999999';
  const adminPasswordRaw = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminPasswordHash = await bcrypt.hash(adminPasswordRaw, 12);

  // Safely remove any different user holding the same admin email to prevent unique constraint violations
  const conflictingUser = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (conflictingUser && conflictingUser.phone !== adminPhone) {
    console.log(`⚠️  Found conflicting user with email ${adminEmail} but different phone. Removing conflict...`);
    await prisma.user.delete({ where: { id: conflictingUser.id } });
  }

  // Find existing by phone
  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });

  let admin;
  if (existingAdmin) {
    admin = await prisma.user.update({
      where: { phone: adminPhone },
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        isEmailVerified: true,
        isPhoneVerified: true
      }
    });
    console.log(`✅ Admin user updated: ${admin.email} (${admin.phone})`);
  } else {
    admin = await prisma.user.create({
      data: {
        name: 'ProjectX Admin',
        phone: adminPhone,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        authProvider: 'EMAIL',
        isPhoneVerified: true,
        isEmailVerified: true,
        isProfileComplete: true,
        city: 'Bhopal',
        area: 'MP Nagar',
        referralCode: 'ADMINPX001',
      },
    });
    console.log(`✅ Admin user created: ${admin.email} (${admin.phone})`);
  }
  
  console.log(`✅ Admin credentials synced successfully`);

  // 2. Create Admin Settings
  const defaultSettings = [
    { key: 'maintenance_mode', value: false },
    { key: 'registration_enabled', value: true },
    { key: 'max_property_photos', value: 10 },
    { key: 'max_mess_photos', value: 15 },
    { key: 'otp_expiry_minutes', value: 5 },
    { key: 'supported_cities', value: ['Bhopal', 'Indore', 'Patna', 'Kota', 'Jaipur', 'Lucknow', 'Delhi NCR', 'Bangalore', 'Mumbai', 'Pune'] },
    { key: 'contact_email', value: 'support@projectx.in' },
    { key: 'contact_phone', value: '+911234567890' },
    { key: 'terms_url', value: 'https://projectx.in/terms' },
    { key: 'privacy_url', value: 'https://projectx.in/privacy' },
  ];

  for (const setting of defaultSettings) {
    await prisma.adminSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log(`✅ ${defaultSettings.length} admin settings created`);

  // 3. Create Coming Soon initial counts (seed some signups)
  const comingSoonServices = ['HOME_SERVICES', 'VEHICLE_SERVICES', 'MEDICAL_SERVICES', 'UTILITY_BOOKING', 'LABOUR_CHOWK'] as const;
  console.log(`✅ Coming soon services ready: ${comingSoonServices.length} services`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Admin login credentials:');
  console.log(`  Email: ${admin.email}`);
  console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
  console.log(`  Phone: ${admin.phone}`);
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

// @ts-nocheck
/**
 * Create 2dsphere geospatial indexes on location fields
 * Required for $near, $geoWithin queries via Prisma's findRaw
 *
 * Prerequisites: npm install mongodb
 * Run: npx tsx scripts/create-indexes.ts
 */
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function createIndexes() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Create 2dsphere indexes
    const collections = [
      { name: 'Property', field: 'location' },
      { name: 'MessProfile', field: 'location' },
      { name: 'CookProfile', field: 'location' },
      { name: 'RoommateProfile', field: 'location' },
      { name: 'User', field: 'location' },
    ];

    for (const col of collections) {
      try {
        await db.collection(col.name).createIndex({ [col.field]: '2dsphere' });
        console.log(`✅ 2dsphere index created on ${col.name}.${col.field}`);
      } catch (err: any) {
        if (err.code === 85 || err.code === 86) {
          console.log(`⚠️ Index already exists on ${col.name}.${col.field}`);
        } else {
          console.error(`❌ Failed to create index on ${col.name}.${col.field}:`, err.message);
        }
      }
    }

    // Create text search indexes
    try {
      await db.collection('Property').createIndex(
        { title: 'text', description: 'text', area: 'text', nearLandmark: 'text' },
        { name: 'property_text_search' }
      );
      console.log('✅ Text search index created on Property');
    } catch {
      console.log('⚠️ Text search index already exists on Property');
    }

    console.log('\n🎉 All indexes created!\n');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();

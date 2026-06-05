# 🗄️ Database Schema — Complete Reference

## Overview

ProjectX uses **MongoDB** as its primary database with **Prisma ORM** for type-safe access. The schema consists of **22 models** organized across 11 domains, supporting all Phase 1 services.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           PROJECTX DATABASE SCHEMA                            │
│                              MongoDB + Prisma 7                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                              USER DOMAIN                                │  │
│  │  ┌──────────┐                                                           │  │
│  │  │   User   │◀─────────────────────────────────────────────────────┐    │  │
│  │  └────┬─────┘                                                      │    │  │
│  │       │                                                            │    │  │
│  │       │ 1:N                                                        │    │  │
│  │       ▼                                                            │    │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────────┐ │    │  │
│  │  │ Notification │  │   Referral     │  │  ComingSoonSignup       │ │    │  │
│  │  └──────────────┘  └────────────────┘  └─────────────────────────┘ │    │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           PROPERTY DOMAIN                               │  │
│  │                                                                         │  │
│  │  User ──1:N──▶ ┌───────────┐ ◀──M:N──┐                                  │  │
│  │                │  Property │         │                                  │  │
│  │                └─────┬─────┘         │                                  │  │
│  │                      │               │                                  │  │
│  │            ┌─────────┼─────────┐     │                                  │  │
│  │            │         │         │     │                                  │  │
│  │            ▼         ▼         ▼     │                                  │  │
│  │  ┌─────────────┐ ┌────────┐ ┌────────┴────┐ ┌───────────────────────┐   │  │
│  │  │  Inquiry    │ │ Saved  │ │ NumberView  │ │    PropertyAlert      │   │  │
│  │  └─────────────┘ └────────┘ └─────────────┘ └───────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           ROOMMATE DOMAIN                               │  │
│  │                                                                         │  │
│  │  User ──1:1──▶ ┌─────────────────┐                                      │  │
│  │                │ RoommateProfile │                                      │  │
│  │                └────────┬────────┘                                      │  │
│  │                         │                                               │  │
│  │            ┌────────────┼────────────┐                                  │  │
│  │            │            │            │                                  │  │
│  │            ▼            ▼            ▼                                  │  │
│  │  ┌─────────────────┐ ┌─────────┐ ┌──────────────────────────┐           │  │
│  │  │RoommateInterest │ │  Group  │ │   RoommateGroupMember    │           │  │
│  │  │ (sender/recv)   │ │         │ │                          │           │  │
│  │  └─────────────────┘ └─────────┘ └──────────────────────────┘           │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                         MESS / TIFFIN DOMAIN                            │  │
│  │                                                                         │  │
│  │  User ──1:1──▶ ┌─────────────┐ ◀──M:N── User (saved)                    │  │
│  │                │ MessProfile │                                          │  │
│  │                └──────┬──────┘                                          │  │
│  │                       │                                                 │  │
│  │            ┌──────────┼──────────┐                                      │  │
│  │            ▼          ▼          ▼                                      │  │
│  │     ┌──────────┐ ┌──────────┐ ┌──────────┐                              │  │
│  │     │ MessMenu │ │ MessSaved│ │  Review  │                              │  │
│  │     └──────────┘ └──────────┘ └──────────┘                              │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                              COOK DOMAIN                                │  │
│  │                                                                         │  │
│  │  User ──1:1──▶ ┌─────────────┐ ◀──M:N── User (saved)                    │  │
│  │                │ CookProfile │                                          │  │
│  │                └──────┬──────┘                                          │  │
│  │                       │                                                 │  │
│  │            ┌──────────┴──────────┐                                      │  │
│  │            ▼                     ▼                                      │  │
│  │     ┌──────────┐          ┌──────────┐                                  │  │
│  │     │CookSaved │          │  Review  │                                  │  │
│  │     └──────────┘          └──────────┘                                  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                              CHAT DOMAIN                                │  │
│  │                                                                         │  │
│  │  ┌──────────────────────┐                                               │  │
│  │  │  ChatConversation    │──1:N──▶ ┌─────────────┐                       │  │
│  │  │  (participantIds[])  │         │ ChatMessage │                       │  │
│  │  └──────────────────────┘         └─────────────┘                       │  │
│  │           │                              │                              │  │
│  │           └──────────────┬───────────────┘                              │  │
│  │                          ▼                                              │  │
│  │                       User (sender)                                     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           SHARED DOMAIN                                 │  │
│  │                                                                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  ┌───────────────────┐ │  │
│  │  │  Review  │  │  Report  │  │  AdminSetting   │  │ ComingSoonSignup  │ │  │
│  │  │(polymor.)│  │(polymor.)│  │   (key-value)   │  │                   │ │  │
│  │  └──────────┘  └──────────┘  └─────────────────┘  └───────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Stats

| Metric | Count |
|--------|-------|
| **Total Models** | 22 |
| **Total Enums** | 28 |
| **Domains** | 11 |
| **Relations** | 35+ |

---

## Complete Enum Reference

### User & Auth Enums

```prisma
enum UserRole {
  USER              // Regular user
  OWNER             // Property owner
  COOK_PROVIDER     // Cook service provider
  MESS_OWNER        // Mess/tiffin owner
  ADMIN             // Platform admin
}

enum AuthProvider {
  PHONE             // Phone + OTP
  GOOGLE            // Google OAuth
  EMAIL             // Email + Password
}

enum Gender {
  MALE
  FEMALE
  OTHER
}
```

### Property Enums

```prisma
enum PropertyType {
  // Residential - Single Rooms
  SINGLE_ROOM_INDEPENDENT    // Independent single room with separate entrance
  SINGLE_ROOM_DEPENDENT      // Single room with shared entrance
  SHARED_ROOM                // Room shared with others
  
  // Residential - Apartments
  ONE_RK                     // 1 Room Kitchen (studio)
  ONE_BHK                    // 1 Bedroom Hall Kitchen
  TWO_BHK                    // 2 Bedroom Hall Kitchen
  THREE_BHK                  // 3 Bedroom Hall Kitchen
  DUPLEX                     // Two-floor apartment
  
  // Student Housing
  HOSTEL_BOYS                // Boys hostel
  HOSTEL_GIRLS               // Girls hostel
  PG                         // Paying Guest accommodation
  
  // Commercial
  SHOP                       // Retail shop
  OFFICE                     // Office space
  GODOWN                     // Warehouse/storage
  CLINIC                     // Medical clinic space
  RESTAURANT_SPACE           // Restaurant/cafe space
  PARKING                    // Parking space
}

enum PropertyCategory {
  RESIDENTIAL                // Homes, apartments, rooms
  STUDENT                    // Hostels, PGs, student housing
  COMMERCIAL                 // Shops, offices, warehouses
}

enum AvailableFor {
  BOYS_ONLY                  // Only male tenants
  GIRLS_ONLY                 // Only female tenants
  BOTH                       // Both genders allowed
  FAMILY_ONLY                // Only families
  BACHELORS_ALLOWED          // Bachelors welcome
  STUDENTS_ONLY              // Only students
  WORKING_PROFESSIONALS      // Only working professionals
  ANY                        // No restrictions
}

enum FurnishingType {
  FURNISHED                  // Fully furnished
  SEMI_FURNISHED             // Partially furnished
  UNFURNISHED                // No furniture
}

enum NegotiableType {
  FIXED                      // Price is final
  SLIGHTLY_NEGOTIABLE        // Small negotiation possible
  NEGOTIABLE                 // Open to negotiation
}

enum MinimumStay {
  NO_MINIMUM                 // No lock-in period
  THREE_MONTHS               // 3-month minimum
  SIX_MONTHS                 // 6-month minimum
  ELEVEN_MONTHS              // 11-month lease
  ONE_YEAR_PLUS              // 1+ year lease
}

enum PropertyStatus {
  DRAFT                      // Not yet submitted
  PENDING_REVIEW             // Awaiting admin approval
  ACTIVE                     // Live and visible
  RENTED                     // No longer available
  REJECTED                   // Admin rejected
  DELETED                    // Soft deleted
}
```

### Roommate Matching Enums

```prisma
enum FoodPreference {
  VEG                        // Vegetarian only
  NON_VEG                    // Non-vegetarian
  BOTH                       // No preference
}

enum SmokingPreference {
  NO                         // Non-smoker
  YES                        // Smoker
}

enum DrinkingPreference {
  NO                         // Does not drink
  OCCASIONAL                 // Drinks occasionally
  REGULAR                    // Regular drinker
}

enum SleepSchedule {
  EARLY_BIRD                 // Sleeps early, wakes early
  NIGHT_OWL                  // Sleeps late, wakes late
}

enum PersonalityType {
  INTROVERT                  // Prefers quiet, alone time
  EXTROVERT                  // Social, outgoing
  AMBIVERT                   // Mix of both
}

enum CleanlinessLevel {
  VERY_CLEAN                 // High cleanliness standards
  NORMAL                     // Average cleanliness
  FLEXIBLE                   // Not particular about cleanliness
}

enum GuestPreference {
  OKAY                       // Guests always welcome
  SOMETIMES                  // Occasional guests okay
  NOT_OKAY                   // No guests preferred
}

enum NoisePreference {
  OKAY                       // Noise doesn't bother
  PREFER_QUIET               // Prefers quiet environment
}

enum Profession {
  STUDENT                    // College/university student
  WORKING                    // Employed professional
  FREELANCER                 // Self-employed/freelancer
  BUSINESS                   // Business owner
}

enum GenderPreference {
  SAME                       // Same gender roommate only
  ANY                        // Any gender acceptable
}

enum InterestStatus {
  PENDING                    // Interest sent, awaiting response
  ACCEPTED                   // Interest accepted
  DECLINED                   // Interest declined
}

enum RoommateDuration {
  ONE_TO_THREE_MONTHS        // Short-term (1-3 months)
  THREE_TO_SIX_MONTHS        // Medium-term (3-6 months)
  SIX_TO_TWELVE_MONTHS       // Long-term (6-12 months)
  ONE_YEAR_PLUS              // 1+ year commitment
}
```

### Service Enums

```prisma
enum MealType {
  BREAKFAST                  // Morning meal
  LUNCH                      // Afternoon meal
  DINNER                     // Evening meal
}

enum CookServiceType {
  ONE_TIME_VISIT             // Single cooking visit
  DAILY_COOK                 // Regular daily service
  MONTHLY_SUBSCRIPTION       // Monthly package
}
```

### Chat Enums

```prisma
enum MessageType {
  TEXT                       // Plain text message
  IMAGE                      // Image attachment
  LOCATION                   // GPS coordinates
  LISTING_SHARE              // Shared property/mess/cook card
}

enum ChatContext {
  PROPERTY                   // Chat about property
  ROOMMATE                   // Chat about roommate matching
  MESS                       // Chat about mess service
  COOK                       // Chat about cook hiring
}
```

### Notification Enums

```prisma
enum NotificationType {
  // Property notifications
  PROPERTY_INQUIRY           // Someone inquired about your property
  PROPERTY_ALERT_MATCH       // New property matches your alert
  SAVED_PROPERTY_RENTED      // Saved property got rented
  
  // Roommate notifications
  ROOMMATE_INTEREST_RECEIVED // Someone sent interest
  ROOMMATE_INTEREST_ACCEPTED // Your interest was accepted
  ROOMMATE_INTEREST_DECLINED // Your interest was declined
  
  // Service notifications
  MESS_INQUIRY               // Inquiry about mess
  COOK_INQUIRY               // Inquiry about cook
  
  // Chat notifications
  NEW_CHAT_MESSAGE           // New message when offline
  
  // System notifications
  WELCOME                    // Welcome to platform
  PROFILE_VERIFIED           // Profile verified by admin
  LISTING_VERIFIED           // Listing verified by admin
  ADMIN_ANNOUNCEMENT         // Admin broadcast
  SERVICE_LAUNCHED           // Coming soon service launched
}
```

### Report & Moderation Enums

```prisma
enum ReviewTargetType {
  PROPERTY                   // Review for property
  MESS                       // Review for mess
  COOK                       // Review for cook
  ROOMMATE                   // Review for roommate
}

enum ReportTargetType {
  PROPERTY                   // Report a property
  MESS                       // Report a mess
  COOK                       // Report a cook
  ROOMMATE                   // Report a roommate profile
  USER                       // Report a user
  REVIEW                     // Report a review
}

enum ReportStatus {
  PENDING                    // Report received, not reviewed
  REVIEWED                   // Admin reviewed
  WARNED                     // Warning issued to user
  BLOCKED                    // User/content blocked
  REMOVED                    // Content removed
  DISMISSED                  // Report dismissed (false report)
}
```

### Coming Soon Enums

```prisma
enum ComingSoonService {
  HOME_SERVICES              // Plumber, electrician, etc.
  VEHICLE_SERVICES           // Car/bike repair
  MEDICAL_SERVICES           // Doctor at home
  UTILITY_BOOKING            // Gas, water tanker
  LABOUR_CHOWK               // Daily wage workers
}
```

---

## Model Definitions

### 1. User Model

The central model connecting all user activities.

```prisma
model User {
  id              String       @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  phone           String       @unique
  email           String?
  passwordHash    String?
  profilePhoto    String?
  authProvider    AuthProvider @default(PHONE)
  googleId        String?      @unique
  role            UserRole     @default(USER)

  // Verification status
  isPhoneVerified   Boolean @default(false)
  isEmailVerified   Boolean @default(false)
  isProfileComplete Boolean @default(false)
  isBlocked         Boolean @default(false)

  // Location
  city     String?
  area     String?
  location Json?              // GeoJSON Point: { type: "Point", coordinates: [lng, lat] }

  // Preferences
  interests String[]          // Interest tags
  language  String   @default("en")

  // OTP (temporary storage if Redis unavailable)
  otpCode      String?
  otpExpiresAt DateTime?

  // Session
  refreshToken String?

  // Referral system
  referralCode String? @unique
  referredBy   String? @db.ObjectId

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  properties        Property[]
  propertyInquiries PropertyInquiry[]
  propertySaved     PropertySaved[]
  propertyAlerts    PropertyAlert[]
  roommateProfile   RoommateProfile?
  messProfile       MessProfile?
  cookProfile       CookProfile?
  sentMessages      ChatMessage[]        @relation("sender")
  notifications     Notification[]
  reviews           Review[]
  reports           Report[]
  comingSoonSignups ComingSoonSignup[]
  referrals         Referral[]           @relation("referrer")
}
```

**Field Breakdown:**

| Field | Type | Purpose |
|-------|------|---------|
| `id` | ObjectId | Primary key (MongoDB auto-generated) |
| `name` | String | Display name |
| `phone` | String (unique) | Primary identifier, used for login |
| `email` | String? | Optional email for password login |
| `passwordHash` | String? | bcrypt hash, only if using email login |
| `profilePhoto` | String? | Cloudinary URL |
| `authProvider` | Enum | How user registered |
| `googleId` | String? | Google OAuth ID |
| `role` | Enum | User permissions level |
| `location` | Json? | GeoJSON for proximity features |
| `refreshToken` | String? | Current valid refresh token |
| `referralCode` | String? | User's unique referral code |

---

### 2. Property Model

Core model for property listings.

```prisma
model Property {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  ownerId  String @db.ObjectId
  owner    User   @relation(fields: [ownerId], references: [id])

  // Basic Info
  title        String
  description  String
  propertyType PropertyType
  category     PropertyCategory
  availableFor AvailableFor
  dependency   String                // "Independent" or "Dependent"

  // Pricing
  rent              Int
  deposit           Int?
  negotiable        NegotiableType  @default(FIXED)
  maintenanceExtra  Boolean         @default(false)
  maintenanceAmount Int?
  minimumStay       MinimumStay     @default(NO_MINIMUM)
  availableFrom     DateTime

  // Features
  furnishing   FurnishingType
  amenities    String[]              // ["WIFI", "AC", "PARKING", "GYM", ...]
  specialRules String?               // "No pets", "No smoking", etc.

  // Location
  address      String
  area         String
  city         String
  pincode      String
  location     Json                  // GeoJSON Point
  nearLandmark String?

  // Media
  photos       String[]              // Cloudinary URLs
  videoTourUrl String?               // YouTube/Cloudinary video

  // Status & Visibility
  status     PropertyStatus @default(DRAFT)
  isVerified Boolean        @default(false)
  isFeatured Boolean        @default(false)
  viewCount  Int            @default(0)
  slug       String         @unique
  isDeleted  Boolean        @default(false)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  inquiries   PropertyInquiry[]
  savedBy     PropertySaved[]
  numberViews PropertyNumberView[]
  reviews     Review[]
}
```

**Indexes Required:**

```javascript
// Create in MongoDB shell or via scripts/create-indexes.ts
db.Property.createIndex({ location: "2dsphere" });    // Geo queries
db.Property.createIndex({ slug: 1 }, { unique: true }); // URL slugs
db.Property.createIndex({ ownerId: 1 });               // Owner's listings
db.Property.createIndex({ city: 1, area: 1 });         // City/area filters
db.Property.createIndex({ status: 1 });                // Status filtering
db.Property.createIndex({ rent: 1 });                  // Price sorting
```

---

### 3. Property Supporting Models

```prisma
model PropertyInquiry {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  propertyId String   @db.ObjectId
  property   Property @relation(fields: [propertyId], references: [id])
  userId     String   @db.ObjectId
  user       User     @relation(fields: [userId], references: [id])
  message    String?                  // Optional inquiry message
  isRead     Boolean  @default(false) // Has owner seen this?
  createdAt  DateTime @default(now())
}

model PropertySaved {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  propertyId String   @db.ObjectId
  property   Property @relation(fields: [propertyId], references: [id])
  userId     String   @db.ObjectId
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())

  @@unique([propertyId, userId])      // One save per user per property
}

model PropertyAlert {
  id           String          @id @default(auto()) @map("_id") @db.ObjectId
  userId       String          @db.ObjectId
  user         User            @relation(fields: [userId], references: [id])
  
  // Alert criteria
  city         String
  area         String?
  budgetMin    Int?
  budgetMax    Int?
  propertyType PropertyType?
  availableFor AvailableFor?
  furnishing   FurnishingType?
  
  isActive     Boolean         @default(true)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model PropertyNumberView {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  propertyId String   @db.ObjectId
  property   Property @relation(fields: [propertyId], references: [id])
  viewerId   String   @db.ObjectId           // Who viewed the number
  viewedAt   DateTime @default(now())

  @@unique([propertyId, viewerId])           // Track unique views
}
```

---

### 4. Roommate Models

```prisma
model RoommateProfile {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @unique @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])

  // Basic Info
  photo       String
  age         Int
  gender      Gender
  profession  Profession
  collegeName String?                // If student
  companyName String?                // If working

  // Lifestyle Preferences (for matching algorithm)
  food        FoodPreference
  smoking     SmokingPreference
  drinking    DrinkingPreference
  sleep       SleepSchedule
  personality PersonalityType
  petFriendly Boolean          @default(false)
  cleanliness CleanlinessLevel
  guests      GuestPreference
  noise       NoisePreference

  // Housing Requirements
  budgetMin       Int
  budgetMax       Int
  preferredAreas  String[]              // ["MP Nagar", "Arera Colony"]
  moveInDate      DateTime?
  duration        RoommateDuration?
  roomPreferences String[]              // ["Attached bathroom", "Balcony"]
  preferredGender GenderPreference @default(ANY)

  // If user has a room to share
  bio           String
  hasRoom       Boolean  @default(false)
  roomAddress   String?
  roomArea      String?
  rentPerPerson Int?
  occupants     Int?                    // Current occupants
  roomPhotos    String[]
  roomAmenities String[]

  // Location
  city     String
  area     String?
  location Json?

  // Status
  isActive   Boolean @default(true)
  isVerified Boolean @default(false)
  viewCount  Int     @default(0)
  isDeleted  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  sentInterests     RoommateInterest[] @relation("sender")
  receivedInterests RoommateInterest[] @relation("receiver")
  groups            RoommateGroupMember[]
}

model RoommateInterest {
  id         String          @id @default(auto()) @map("_id") @db.ObjectId
  senderId   String          @db.ObjectId
  sender     RoommateProfile @relation("sender", fields: [senderId], references: [id])
  receiverId String          @db.ObjectId
  receiver   RoommateProfile @relation("receiver", fields: [receiverId], references: [id])
  message    String?                     // "Hey, I saw your profile..."
  status     InterestStatus  @default(PENDING)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  @@unique([senderId, receiverId])       // Prevent duplicate interests
}

model RoommateGroup {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String                     // "MANIT Bhopal Roommates"
  description String?
  city        String
  area        String?
  maxMembers  Int      @default(10)
  createdById String   @db.ObjectId      // Group creator
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members RoommateGroupMember[]
}

model RoommateGroupMember {
  id        String          @id @default(auto()) @map("_id") @db.ObjectId
  groupId   String          @db.ObjectId
  group     RoommateGroup   @relation(fields: [groupId], references: [id])
  profileId String          @db.ObjectId
  profile   RoommateProfile @relation(fields: [profileId], references: [id])
  joinedAt  DateTime        @default(now())

  @@unique([groupId, profileId])         // One membership per group
}
```

**Matching Algorithm Fields:**

| Factor | Field | Weight | Match Logic |
|--------|-------|--------|-------------|
| 🥘 Food | `food` | 15% | Same or either is BOTH |
| 🚬 Smoking | `smoking` | 15% | Must match exactly |
| 💰 Budget | `budgetMin/Max` | 15% | Ranges overlap |
| 🍺 Drinking | `drinking` | 10% | Must match exactly |
| 😴 Sleep | `sleep` | 10% | Same schedule |
| 🧹 Clean | `cleanliness` | 10% | Same or FLEXIBLE |
| 📍 Location | `city/area` | 10% | Same city/area |
| 💼 Work | `profession` | 5% | Same profession |
| 🧠 Personality | `personality` | 5% | Same or AMBIVERT |
| 👫 Gender | `preferredGender` | 5% | ANY matches all |

---

### 5. Mess / Tiffin Models

```prisma
model MessProfile {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  ownerId   String @unique @db.ObjectId
  owner     User   @relation(fields: [ownerId], references: [id])

  // Basic Info
  name        String
  ownerName   String
  description String
  photos      String[]

  // Location
  address  String
  area     String
  city     String
  pincode  String
  location Json                  // GeoJSON Point

  // Food Details
  foodType  FoodPreference       // VEG, NON_VEG, BOTH
  mealTypes MealType[]           // [BREAKFAST, LUNCH, DINNER]

  // Timings (JSON object)
  timings Json
  // Example: {
  //   "breakfast": { "start": "07:30", "end": "10:00" },
  //   "lunch": { "start": "12:00", "end": "15:00" },
  //   "dinner": { "start": "19:00", "end": "22:00" }
  // }

  // Pricing
  pricePerMeal      Int?         // ₹60 per meal
  monthlyOneMeal    Int?         // ₹1,500/month for 1 meal/day
  monthlyTwoMeals   Int?         // ₹2,800/month for 2 meals/day
  monthlyThreeMeals Int?         // ₹3,800/month for 3 meals/day
  trialMealPrice    Int?         // ₹50 trial

  // Services
  deliveryAvailable Boolean @default(false)
  deliveryRadius    Float?       // km radius for delivery

  tiffinService   Boolean  @default(false)
  seatingCapacity Int?
  features        String[]       // ["HOME_STYLE", "UNLIMITED", "AC"]

  // Status
  isVerified Boolean @default(false)
  isFeatured Boolean @default(false)
  isActive   Boolean @default(true)
  viewCount  Int     @default(0)
  slug       String  @unique
  isDeleted  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  menus   MessMenu[]
  savedBy MessSaved[]
  reviews Review[]
}

model MessMenu {
  id        String      @id @default(auto()) @map("_id") @db.ObjectId
  messId    String      @db.ObjectId
  mess      MessProfile @relation(fields: [messId], references: [id])
  date      DateTime                 // Menu date
  mealType  MealType                 // BREAKFAST, LUNCH, or DINNER
  items     String[]                 // ["Dal Tadka", "Rice", "Roti", "Sabzi"]
  photo     String?                  // Today's thali photo
  createdAt DateTime    @default(now())

  @@unique([messId, date, mealType]) // One menu per meal per day
}

model MessSaved {
  id        String      @id @default(auto()) @map("_id") @db.ObjectId
  messId    String      @db.ObjectId
  mess      MessProfile @relation(fields: [messId], references: [id])
  userId    String      @db.ObjectId
  createdAt DateTime    @default(now())

  @@unique([messId, userId])
}
```

---

### 6. Cook Models

```prisma
model CookProfile {
  id     String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @unique @db.ObjectId
  user   User   @relation(fields: [userId], references: [id])

  // Personal Info
  fullName   String
  photo      String
  gender     Gender
  age        Int
  experience Int                  // Years of experience

  // Skills
  speciality   FoodPreference       // VEG, NON_VEG, BOTH
  cuisineTypes String[]             // ["North Indian", "South Indian", "Chinese"]
  serviceTypes CookServiceType[]    // [DAILY_COOK, MONTHLY_SUBSCRIPTION]

  // Pricing
  pricePerVisit   Int?              // ₹300/visit
  monthlyOneMeal  Int?              // ₹4,000/month for 1 meal/day
  monthlyTwoMeals Int?              // ₹7,000/month for 2 meals/day

  // Service Area
  serviceAreas String[]             // Areas cook can work in
  city         String
  pincode      String
  location     Json?

  // Availability (JSON object)
  availableSlots Json
  // Example: {
  //   "morning": { "start": "06:00", "end": "10:00" },
  //   "evening": { "start": "17:00", "end": "21:00" }
  // }

  // Status
  isVerified Boolean @default(false)
  isFeatured Boolean @default(false)
  isActive   Boolean @default(true)
  viewCount  Int     @default(0)
  slug       String  @unique
  isDeleted  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  savedBy CookSaved[]
  reviews Review[]
}

model CookSaved {
  id        String      @id @default(auto()) @map("_id") @db.ObjectId
  cookId    String      @db.ObjectId
  cook      CookProfile @relation(fields: [cookId], references: [id])
  userId    String      @db.ObjectId
  createdAt DateTime    @default(now())

  @@unique([cookId, userId])
}
```

---

### 7. Chat Models

```prisma
model ChatConversation {
  id             String      @id @default(auto()) @map("_id") @db.ObjectId
  participantIds String[]    @db.ObjectId     // [userId1, userId2]
  context        ChatContext                   // PROPERTY, ROOMMATE, MESS, COOK
  contextId      String?     @db.ObjectId     // Related entity ID
  lastMessage    String?                       // Message preview
  lastMessageAt  DateTime?                     // For sorting
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  messages ChatMessage[]
}

model ChatMessage {
  id             String           @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String           @db.ObjectId
  conversation   ChatConversation @relation(fields: [conversationId], references: [id])
  senderId       String           @db.ObjectId
  sender         User             @relation("sender", fields: [senderId], references: [id])
  type           MessageType      @default(TEXT)
  content        String
  metadata       Json?                        // Type-specific data
  isRead         Boolean          @default(false)
  createdAt      DateTime         @default(now())
}
```

**Metadata Examples by Type:**

```json
// TEXT: No metadata needed
{ "type": "TEXT", "content": "Hello!", "metadata": null }

// IMAGE
{
  "type": "IMAGE",
  "content": "Room photo",
  "metadata": {
    "url": "https://cloudinary.com/...",
    "thumbnail": "https://cloudinary.com/.../thumb",
    "width": 1920,
    "height": 1080
  }
}

// LOCATION
{
  "type": "LOCATION",
  "content": "Meeting here",
  "metadata": {
    "lat": 23.2332,
    "lng": 77.4345,
    "address": "MP Nagar Zone 1"
  }
}

// LISTING_SHARE
{
  "type": "LISTING_SHARE",
  "content": "Check this property",
  "metadata": {
    "listingType": "PROPERTY",
    "listingId": "abc123",
    "title": "2BHK in MP Nagar",
    "rent": 12000,
    "photo": "https://cloudinary.com/..."
  }
}
```

---

### 8. Notification Model

```prisma
model Notification {
  id        String           @id @default(auto()) @map("_id") @db.ObjectId
  userId    String           @db.ObjectId
  user      User             @relation(fields: [userId], references: [id])
  type      NotificationType
  title     String                       // "New Inquiry"
  body      String                       // "Rahul inquired about your property"
  data      Json?                        // Action data (deepLink, entityId, etc.)
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
}
```

**Data Field Examples:**

```json
// Property Inquiry
{
  "type": "PROPERTY_INQUIRY",
  "data": {
    "propertyId": "abc123",
    "inquiryId": "xyz789",
    "deepLink": "projectx://property/abc123/inquiries"
  }
}

// Roommate Interest
{
  "type": "ROOMMATE_INTEREST_RECEIVED",
  "data": {
    "profileId": "sender_profile_id",
    "interestId": "interest_id",
    "deepLink": "projectx://roommate/interests"
  }
}

// New Chat Message
{
  "type": "NEW_CHAT_MESSAGE",
  "data": {
    "conversationId": "conv_123",
    "senderId": "user_456",
    "senderName": "Rahul",
    "deepLink": "projectx://chat/conv_123"
  }
}
```

---

### 9. Review Model (Polymorphic)

```prisma
model Review {
  id         String           @id @default(auto()) @map("_id") @db.ObjectId
  userId     String           @db.ObjectId
  user       User             @relation(fields: [userId], references: [id])
  targetType ReviewTargetType             // PROPERTY, MESS, COOK, ROOMMATE
  targetId   String           @db.ObjectId

  // Direct relations (for Prisma — only one will be set)
  propertyId String?      @db.ObjectId
  property   Property?    @relation(fields: [propertyId], references: [id])
  messId     String?      @db.ObjectId
  mess       MessProfile? @relation(fields: [messId], references: [id])
  cookId     String?      @db.ObjectId
  cook       CookProfile? @relation(fields: [cookId], references: [id])

  // Review Content
  rating     Int                          // 1-5 stars
  comment    String?
  photos     String[]

  // Admin controls
  isHidden   Boolean  @default(false)
  isFeatured Boolean  @default(false)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

### 10. Report Model (Polymorphic)

```prisma
model Report {
  id          String           @id @default(auto()) @map("_id") @db.ObjectId
  reporterId  String           @db.ObjectId
  reporter    User             @relation(fields: [reporterId], references: [id])
  targetType  ReportTargetType             // What's being reported
  targetId    String           @db.ObjectId
  reason      String                       // "Spam", "Fake listing", etc.
  description String?                      // Additional details
  status      ReportStatus     @default(PENDING)
  adminNote   String?                      // Admin's internal notes
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

---

### 11. Supporting Models

```prisma
model ComingSoonSignup {
  id        String            @id @default(auto()) @map("_id") @db.ObjectId
  userId    String?           @db.ObjectId
  user      User?             @relation(fields: [userId], references: [id])
  service   ComingSoonService
  phone     String?
  email     String?
  city      String?
  createdAt DateTime          @default(now())

  @@unique([service, phone])             // One signup per service per phone
}

model Referral {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  referrerId    String   @db.ObjectId
  referrer      User     @relation("referrer", fields: [referrerId], references: [id])
  referredPhone String                   // Phone of referred person
  isConverted   Boolean  @default(false) // Did they sign up?
  createdAt     DateTime @default(now())
}

model AdminSetting {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
}
```

**Default Admin Settings:**

```json
[
  { "key": "maintenance_mode", "value": false },
  { "key": "registration_enabled", "value": true },
  { "key": "max_property_photos", "value": 10 },
  { "key": "max_mess_photos", "value": 10 },
  { "key": "otp_expiry_minutes", "value": 5 },
  { "key": "supported_cities", "value": ["Bhopal", "Indore", "Delhi NCR", "..."] },
  { "key": "contact_email", "value": "support@projectx.in" },
  { "key": "contact_phone", "value": "+919876543210" },
  { "key": "terms_url", "value": "https://projectx.in/terms" },
  { "key": "privacy_url", "value": "https://projectx.in/privacy" }
]
```

---

## GeoJSON Location Format

All location fields use MongoDB's GeoJSON format:

```typescript
// src/utils/geo.util.ts

export const createGeoPoint = (lat: number, lng: number) => ({
  type: 'Point',
  coordinates: [lng, lat],  // ⚠️ GeoJSON is [longitude, latitude]
});

// Example stored data:
{
  "location": {
    "type": "Point",
    "coordinates": [77.4345, 23.2332]  // [lng, lat]
  }
}
```

**Proximity Query:**

```typescript
export const buildNearQuery = (lat: number, lng: number, maxDistanceMeters = 10000) => ({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: maxDistanceMeters,
    },
  },
});
```

---

## Required MongoDB Indexes

Run `npm run setup:indexes` or create manually:

```javascript
// Geospatial indexes (required for $near queries)
db.Property.createIndex({ location: "2dsphere" });
db.MessProfile.createIndex({ location: "2dsphere" });
db.CookProfile.createIndex({ location: "2dsphere" });
db.RoommateProfile.createIndex({ location: "2dsphere" });
db.User.createIndex({ location: "2dsphere" });

// Unique indexes
db.User.createIndex({ phone: 1 }, { unique: true });
db.User.createIndex({ email: 1 }, { unique: true, sparse: true });
db.User.createIndex({ googleId: 1 }, { unique: true, sparse: true });
db.User.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
db.Property.createIndex({ slug: 1 }, { unique: true });
db.MessProfile.createIndex({ slug: 1 }, { unique: true });
db.CookProfile.createIndex({ slug: 1 }, { unique: true });

// Compound indexes for common queries
db.Property.createIndex({ city: 1, area: 1, status: 1 });
db.Property.createIndex({ ownerId: 1, status: 1 });
db.ChatConversation.createIndex({ participantIds: 1 });
db.ChatMessage.createIndex({ conversationId: 1, createdAt: -1 });
db.Notification.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
```

---

## Prisma Configuration

**prisma.config.ts:**

```typescript
import path from 'path';
import { PrismaConfig } from 'prisma';

export default {
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
} satisfies PrismaConfig;
```

**Generator Commands:**

```bash
# Generate Prisma client (after schema changes)
npx prisma generate

# Push schema to database (no migration)
npx prisma db push

# View database in browser
npx prisma studio
```

---

## Data Flow Example

### Property Creation Flow

```
┌─────────────┐                          ┌─────────────────┐
│   CLIENT    │                          │     SERVER      │
├─────────────┤                          ├─────────────────┤
│             │  POST /properties        │                 │
│  Form data  │─────────────────────────▶│ 1. Validate     │
│  + photos   │                          │    with Zod     │
│             │                          │       │         │
│             │                          │       ▼         │
│             │                          │ 2. Upload to    │
│             │                          │    Cloudinary   │
│             │                          │       │         │
│             │                          │       ▼         │
│             │                          │ 3. Create       │
│             │                          │    GeoJSON      │
│             │                          │       │         │
│             │                          │       ▼         │
│             │                          │ 4. Generate     │
│             │                          │    slug         │
│             │                          │       │         │
│             │                          │       ▼         │
│             │                          │ 5. Save to      │
│             │                          │    MongoDB      │
│             │                          │       │         │
│             │  201 Created             │       ▼         │
│  Property   │◀─────────────────────────│ 6. Return       │
│  object     │                          │    property     │
└─────────────┘                          └─────────────────┘
```

---

## Model Count Summary

| Domain | Models | Purpose |
|--------|--------|---------|
| User | 1 | Core user data |
| Property | 4 | Listings, saves, inquiries, alerts, number views |
| Roommate | 4 | Profiles, interests, groups, memberships |
| Mess | 3 | Profiles, menus, saves |
| Cook | 2 | Profiles, saves |
| Chat | 2 | Conversations, messages |
| Notification | 1 | All notification types |
| Review | 1 | Polymorphic reviews |
| Report | 1 | Polymorphic reports |
| Coming Soon | 1 | Service interest signups |
| Referral | 1 | Referral tracking |
| Admin | 1 | Key-value settings |
| **TOTAL** | **22** | |

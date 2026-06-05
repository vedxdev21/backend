# 🚀 ProjectX — Backend API

> All-in-one daily life services platform for India. Find properties, roommates, mess/tiffin, and cooks near you.

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socket.io)](https://socket.io/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Modules](#api-modules)
- [Location System](#location-system)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Postman Collection](#postman-collection)
- [Scripts](#scripts)
- [Documentation](#documentation)

---

## Overview

ProjectX is a **location-based services platform** designed for India's daily needs. Think of it as **Swiggy/Ola for housing and daily services** — it auto-detects user location and shows nearest listings.

### Phase 1 Services (Live)
| Service | Description |
|---------|------------|
| 🏠 **Property Rental** | Broker-free room/flat listings with advanced filters |
| 🤝 **Roommate Finder** | AI-powered lifestyle matching algorithm (10 factors) |
| 🍽️ **Mess/Tiffin Finder** | Nearby mess with daily menus and delivery tracking |
| 👨‍🍳 **Cook Finder** | Find cooks by cuisine, price, and availability |

### Coming Soon (5 more)
Home Services • Vehicle Services • Medical Services • Utility Booking • Labour Chowk

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 22+ | JavaScript runtime |
| **Language** | TypeScript 6 | Type safety across the codebase |
| **Framework** | Express 5 | HTTP server with middleware pipeline |
| **ORM** | Prisma 7 | Type-safe database access |
| **Database** | MongoDB 7 | Document store with geospatial indexes |
| **Cache** | Redis 7 | OTP storage, rate limiting, caching |
| **Real-time** | Socket.io 4 | Chat messages, typing indicators, online status |
| **Auth** | JWT + bcrypt | Access/refresh token pairs |
| **Validation** | Zod 4 | Runtime schema validation |
| **Storage** | Cloudinary | Image upload, optimization, CDN |
| **SMS** | MSG91/Twilio | OTP delivery (console mode for dev) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Web/Mobile)                     │
├──────────────────────┬──────────────────────────────────────┤
│     REST API         │           WebSocket                   │
│   (HTTP + JSON)      │        (Socket.io)                    │
├──────────────────────┴──────────────────────────────────────┤
│                     Express Application                      │
│  ┌─────────┬──────────┬──────────┬──────────┬────────────┐  │
│  │ Helmet  │  CORS    │ Morgan   │ Rate     │ Language   │  │
│  │         │          │          │ Limiter  │ Detect     │  │
│  └─────────┴──────────┴──────────┴──────────┴────────────┘  │
│                     API Routes (/api/v1)                      │
│  ┌──────┬──────┬──────────┬──────┬──────┬──────┬─────────┐  │
│  │ Auth │ User │ Property │ Room │ Mess │ Cook │ Admin   │  │
│  │      │      │          │ mate │      │      │         │  │
│  ├──────┴──────┴──────────┴──────┴──────┴──────┴─────────┤  │
│  │ Chat │ Notification │ Review │ Coming Soon │ Location │  │
│  └──────┴──────────────┴────────┴─────────────┴──────────┘  │
│                     Service Layer                            │
│  ┌───────────────┬─────────────┬──────────────────────────┐  │
│  │ Prisma Client │ Redis Cache │ Cloudinary CDN           │  │
│  └───────┬───────┴──────┬──────┴──────────────────────────┘  │
│          │              │                                    │
│     MongoDB         Redis Server                             │
└──────────────────────────────────────────────────────────────┘
```

### Modular Monolith Pattern

Each module follows this structure:
```
module/
├── module.validation.ts   # Zod schemas for request validation
├── module.service.ts      # Business logic (DB queries, algorithms)
├── module.controller.ts   # HTTP handlers (req → service → res)
└── module.routes.ts       # Express router with middleware
```

> **Why modular monolith?** Clean domain boundaries like microservices, but deployed as one process. Easy to split later if needed.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **MongoDB** ≥ 7.0 (with replica set enabled)
- **Redis** ≥ 7.0 (optional — app works without it)

### Installation

```bash
# 1. Clone and install
git clone <repo-url> && cd masterX
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URL, secrets, etc.

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to MongoDB
npx prisma db push

# 5. Seed admin user + default settings
npm run seed

# 6. Create geospatial indexes (optional: npm install mongodb first)
npm run setup:indexes

# 7. Start development server
npm run dev
```

### Verify

```bash
curl http://localhost:5000/api/health
# { "success": true, "message": "🚀 ProjectX API is running" }
```

---

## Project Structure

```
masterX/
├── prisma/
│   └── schema.prisma           # 22 models, all enums, relations
├── prisma.config.ts             # Prisma 7 datasource config
├── scripts/
│   ├── seed.ts                  # Admin user + settings seeder
│   └── create-indexes.ts        # MongoDB 2dsphere + text indexes
├── postman/
│   └── ProjectX_API_v1.postman_collection.json
├── docs/                        # Module documentation
│   ├── ARCHITECTURE.md
│   ├── LOCATION.md
│   ├── AUTH.md
│   ├── PROPERTY.md
│   ├── ROOMMATE.md
│   ├── MESS.md
│   ├── COOK.md
│   ├── CHAT.md
│   ├── NOTIFICATIONS.md
│   ├── REVIEWS.md
│   ├── COMING_SOON.md
│   └── ADMIN.md
├── src/
│   ├── app.ts                   # Express app configuration
│   ├── server.ts                # HTTP + Socket.io bootstrap
│   ├── config/                  # App configuration
│   │   ├── env.ts               # Zod-validated env vars
│   │   ├── database.ts          # Prisma singleton
│   │   ├── redis.ts             # Redis with fallback
│   │   ├── cloudinary.ts        # Image CDN
│   │   └── constants.ts         # All constants
│   ├── types/                   # TypeScript declarations
│   ├── utils/                   # Shared utilities (8 files)
│   ├── middleware/              # Express middleware (6 files)
│   ├── locales/                 # i18n strings (en, hi)
│   ├── sockets/                 # Socket.io event handlers
│   └── modules/                 # 12 domain modules
└── package.json
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `DATABASE_URL` | **Yes** | — | MongoDB connection string |
| `REDIS_URL` | No | — | Redis URL (optional) |
| `JWT_ACCESS_SECRET` | **Yes** | — | JWT signing secret |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token secret |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Token TTL |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh TTL |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth |
| `CLOUDINARY_CLOUD_NAME` | No | — | Image CDN |
| `SMS_PROVIDER` | No | `console` | `console` / `msg91` / `twilio` |
| `ALLOWED_ORIGINS` | No | `localhost:3000` | CORS origins |

---

## API Modules

| Module | Base Route | Auth | Docs |
|--------|-----------|------|------|
| 🔐 Auth | `/api/v1/auth` | Public | [docs/AUTH.md](docs/AUTH.md) |
| 👤 User | `/api/v1/users` | Required | [docs/USER.md](docs/AUTH.md) |
| 📍 Location | `/api/v1/location` | Public | [docs/LOCATION.md](docs/LOCATION.md) |
| 🏠 Property | `/api/v1/properties` | Required | [docs/PROPERTY.md](docs/PROPERTY.md) |
| 🤝 Roommate | `/api/v1/roommate` | Required | [docs/ROOMMATE.md](docs/ROOMMATE.md) |
| 🍽️ Mess | `/api/v1/mess` | Required | [docs/MESS.md](docs/MESS.md) |
| 👨‍🍳 Cook | `/api/v1/cook` | Required | [docs/COOK.md](docs/COOK.md) |
| 💬 Chat | `/api/v1/chat` | Required | [docs/CHAT.md](docs/CHAT.md) |
| 🔔 Notification | `/api/v1/notifications` | Required | [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md) |
| ⭐ Review | `/api/v1/reviews` | Required | [docs/REVIEWS.md](docs/REVIEWS.md) |
| 🔜 Coming Soon | `/api/v1/coming-soon` | Optional | [docs/COMING_SOON.md](docs/COMING_SOON.md) |
| 🛡️ Admin | `/api/v1/admin` | Admin | [docs/ADMIN.md](docs/ADMIN.md) |

---

## Location System

ProjectX is fundamentally **location-first**. Every listing stores a GeoJSON `Point` and queries use MongoDB's `$near` operator with `2dsphere` indexes.

**How it works:**
1. User opens app → GPS auto-detects coordinates
2. Frontend sends `lat`, `lng` to backend
3. Backend stores as GeoJSON: `{ type: "Point", coordinates: [lng, lat] }`
4. Browse queries use `$near` to sort by proximity
5. Results show distance from user

📖 Full documentation: [docs/LOCATION.md](docs/LOCATION.md)

---

## Authentication Flow

```
Register → Send OTP → Verify OTP → Get Tokens → Access API
                                                      │
Login (Phone+OTP) ─────────────────────────────────────┘
Login (Email+Password) ────────────────────────────────┘
Login (Google OAuth) ──────────────────────────────────┘
                                                      │
                              Token Expired? → Refresh Token
```

📖 Full documentation: [docs/AUTH.md](docs/AUTH.md)

---

## Database Schema

22 Prisma models organized by domain:

| Domain | Models |
|--------|--------|
| **User** | `User` |
| **Property** | `Property`, `PropertySaved`, `PropertyInquiry`, `PropertyAlert`, `PropertyNumberView` |
| **Roommate** | `RoommateProfile`, `RoommateInterest`, `RoommateGroup`, `RoommateGroupMember` |
| **Mess** | `MessProfile`, `MessMenu`, `MessSaved` |
| **Cook** | `CookProfile`, `CookSaved` |
| **Chat** | `ChatConversation`, `ChatMessage` |
| **Review** | `Review` (polymorphic) |
| **Notification** | `Notification` |
| **Report** | `Report` (polymorphic) |
| **Coming Soon** | `ComingSoonSignup` |
| **Admin** | `AdminSetting`, `Referral` |

📖 Full schema documentation: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

---

## Postman Collection

Import `postman/ProjectX_API_v1.postman_collection.json` into Postman.

**Features:**
- ✅ 80+ pre-configured endpoints
- ✅ Auto-token extraction (login → token saved to variables)
- ✅ Sample bodies for every POST/PUT request
- ✅ Collection variables for dynamic IDs

---

## Scripts

```bash
npm run dev              # Start dev server (nodemon + tsx)
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run seed             # Seed admin user + settings
npm run setup:indexes    # Create MongoDB geospatial indexes
npm run lint             # TypeScript type-check
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema to database
```

---

## Documentation

Detailed docs for every module are in the [`docs/`](docs/) folder:

| Document | What's Inside |
|----------|--------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, middleware pipeline, error handling |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Complete schema reference: 22 models, 28 enums, relations |
| [LOCATION.md](docs/LOCATION.md) | GeoJSON, 2dsphere indexes, proximity queries |
| [AUTH.md](docs/AUTH.md) | Registration, OTP, login, tokens, Google OAuth |
| [PROPERTY.md](docs/PROPERTY.md) | Listings, search, save, inquiries, alerts |
| [ROOMMATE.md](docs/ROOMMATE.md) | Matching algorithm, interests, groups |
| [MESS.md](docs/MESS.md) | Registration, menus, delivery, tiffin |
| [COOK.md](docs/COOK.md) | Profiles, cuisine types, pricing |
| [CHAT.md](docs/CHAT.md) | REST + WebSocket, conversations, typing indicators, read receipts |
| [NOTIFICATIONS.md](docs/NOTIFICATIONS.md) | Types, read/unread, real-time push |
| [REVIEWS.md](docs/REVIEWS.md) | Polymorphic reviews, rating stats |
| [COMING_SOON.md](docs/COMING_SOON.md) | Future services, notify-me signups |
| [ADMIN.md](docs/ADMIN.md) | Dashboard, management, analytics |

---

## License

**UNLICENSED** — Private and confidential. © ProjectX Technologies Pvt. Ltd.
# masterX_backend

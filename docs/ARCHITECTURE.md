# 🏗️ Architecture — ProjectX Backend

## System Design Philosophy

ProjectX follows a **Modular Monolith** pattern — the codebase is organized into isolated domain modules, but deployed as a single process.

```
┌────────────────────────────────────────────────────────┐
│                    MODULAR MONOLITH                    │
│                                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Auth │ │ User │ │ Prop │ │ Room │ │ Mess │  ...     │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘          │
│     │        │        │        │        │              │
│  ┌──┴────────┴────────┴────────┴────────┴──┐           │
│  │          Shared Infrastructure           │          │
│  │  (Prisma, Redis, JWT, i18n, Cloudinary)  │          │
│  └─────────────────────────────────────────-┘          │
└────────────────────────────────────────────────────────┘
```

### Why Modular Monolith?
- ✅ Clean domain boundaries (like microservices)
- ✅ No inter-service communication overhead
- ✅ Single deployment unit
- ✅ Easy to extract into microservices later
- ✅ Shared database with Prisma

---

## Request Lifecycle

Every HTTP request flows through this pipeline:

```
Client Request
     │
     ▼
┌─────────────────────────────────────────┐
│ 1. helmet()         — Security headers   │
│ 2. cors()           — Cross-origin       │
│ 3. compression()    — Gzip responses     │
│ 4. express.json()   — Parse body         │
│ 5. cookieParser()   — Parse cookies      │
│ 6. languageMiddleware — Detect lang      │
│ 7. morgan()         — Request logging    │
│ 8. apiLimiter       — Rate limiting      │
├─────────────────────────────────────────┤
│ 9. Route Handler                         │
│    ├─ authenticate()  — Verify JWT       │
│    ├─ validate()      — Zod schema       │
│    ├─ controller()    — Business logic   │
│    └─ sendSuccess/Error — Response       │
├─────────────────────────────────────────┤
│ 10. errorHandler()   — Global catch      │
└─────────────────────────────────────────┘
```

---

## Module Pattern

Every module follows the **Controller-Service-Validation** pattern:

### 1. Validation (`module.validation.ts`)
```typescript
// Zod schemas define what the request body must contain
export const createPropertySchema = z.object({
  title: z.string().min(5).max(100),
  rent: z.number().int().positive(),
  city: z.string().min(1),
  // ...
});
```

### 2. Service (`module.service.ts`)
```typescript
// Business logic — talks to database, no HTTP awareness
export const createProperty = async (userId: string, data: any) => {
  const slug = generateSlug(data.title);
  const location = createGeoPoint(data.lat, data.lng);
  return prisma.property.create({ data: { ...data, ownerId: userId, slug, location } });
};
```

### 3. Controller (`module.controller.ts`)
```typescript
// HTTP handlers — extract req, call service, send response
export const create = async (req: Request, res: Response) => {
  try {
    const property = await propertyService.createProperty(req.user!.id, req.body);
    sendCreated(res, property, t('property.created', req.language));
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};
```

### 4. Routes (`module.routes.ts`)
```typescript
// Wire everything together with middleware
router.post('/', authenticate, validate(createPropertySchema), controller.create);
```

---

## Error Handling

### Service-Level Errors
Throw objects with `statusCode` and `message`:
```typescript
throw { statusCode: 404, message: 'property.not_found' };
```

### Global Error Handler
`errorHandler.middleware.ts` catches everything:
- Prisma errors → mapped to user-friendly messages
- Zod validation errors → formatted field-level errors
- JWT errors → 401 Unauthorized
- Unhandled errors → 500 Internal Server Error

### Standard Response Format
Every API returns:
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": { "id": "...", "title": "..." },
  "meta": { "page": 1, "limit": 12, "total": 45, "totalPages": 4 }
}
```

---

## Rate Limiting

Three tiers of rate limiting protect the API:

| Tier | Limit | Window | Applied To |
|------|-------|--------|-----------|
| **API** | 100 requests | 15 minutes | All `/api/*` routes |
| **Auth** | 20 requests | 15 minutes | Login, register, password reset |
| **OTP** | 5 requests | 5 minutes | OTP send endpoints |

---

## Internationalization (i18n)

- Supports **English** (`en`) and **Hindi** (`hi`)
- Language detected from `x-language` header or `accept-language`
- Translation keys are used in services: `t('property.created', req.language)`
- 65+ translation keys in `src/locales/en.json` and `hi.json`

---

## Caching Strategy

Redis is used for:
1. **OTP Storage** — 5-minute TTL
2. **Rate Limiting** — Request counters
3. **Session Data** — Refresh tokens

If Redis is unavailable, the app continues with:
- OTPs stored in database
- In-memory rate limiting (per-process)
- No session caching

---

## Security

| Layer | Implementation |
|-------|---------------|
| Helmet | HTTP security headers (CSP, HSTS, X-Frame) |
| CORS | Whitelist-based origin control |
| JWT | Short-lived access tokens (15m) + refresh rotation |
| bcrypt | Password hashing (12 rounds) |
| Zod | Input validation on every endpoint |
| Rate Limiting | Brute-force protection on auth routes |
| Multer | File type + size validation for uploads |

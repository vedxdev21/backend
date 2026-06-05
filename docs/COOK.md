# 👨‍🍳 Cook Finder Module

## Overview

Find and hire personal cooks based on cuisine, experience, price, and location. Cooks register their profiles with availability slots, service areas, and pricing. Users can browse, save, and contact cooks directly.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         COOK MODULE ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          USER JOURNEY                               │ │
│  │                                                                     │ │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │ │
│  │  │  Browse   │───▶│  View     │───▶│  Check    │───▶│  Contact  │  │ │
│  │  │  Cooks    │    │  Profile  │    │  Avail.   │    │  via Chat │  │ │
│  │  │  Nearby   │    │  & Price  │    │  Slots    │    │  or Call  │  │ │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          COOK JOURNEY                               │ │
│  │                                                                     │ │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │ │
│  │  │ Register  │───▶│  Set      │───▶│  Define   │───▶│  Track    │  │ │
│  │  │  Profile  │    │  Pricing  │    │  Service  │    │  Analytics│  │ │
│  │  │  & Photo  │    │  & Cuisine│    │  Areas    │    │  Dashboard│  │ │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        DATABASE MODELS                              │ │
│  │                                                                     │ │
│  │  ┌─────────────┐    ┌─────────────┐                                │ │
│  │  │ CookProfile │    │  CookSaved  │                                │ │
│  │  │ (1 per user)│    │ (bookmarks) │                                │ │
│  │  └─────────────┘    └─────────────┘                                │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## REST API Endpoints

### Base URL: `/api/v1/cook`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ✅ | Register cook profile |
| `GET` | `/` | ❌ | Browse cooks |
| `GET` | `/:idOrSlug` | ❌ | Get cook detail |
| `PUT` | `/:id` | ✅ Owner | Update profile |
| `DELETE` | `/:id` | ✅ Owner | Delete profile |
| `POST` | `/:id/save` | ✅ | Toggle save |
| `GET` | `/saved` | ✅ | Get saved cooks |
| `GET` | `/dashboard` | ✅ Owner | Cook's dashboard |

---

## Register Cook Profile

### Request

```http
POST /api/v1/cook/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "Sunita Devi",
  "photo": "https://res.cloudinary.com/projectx/image/upload/cook_photo.jpg",
  "gender": "FEMALE",
  "age": 45,
  "experience": 15,
  
  "speciality": "BOTH",
  "cuisineTypes": ["NORTH_INDIAN", "SOUTH_INDIAN", "RAJASTHANI", "GUJARATI"],
  "serviceTypes": ["DAILY_COOK", "MONTHLY_SUBSCRIPTION"],
  
  "pricePerVisit": 300,
  "monthlyOneMeal": 4000,
  "monthlyTwoMeals": 7000,
  
  "serviceAreas": ["MP Nagar", "Arera Colony", "Shahpura", "Kolar"],
  "city": "Bhopal",
  "pincode": "462011",
  "lat": 23.2332,
  "lng": 77.4345,
  
  "availableSlots": {
    "morning": { "start": "06:00", "end": "10:00" },
    "evening": { "start": "17:00", "end": "21:00" }
  }
}
```

### Field Details

**Personal Info:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | ✅ | Cook's full name |
| `photo` | string | ✅ | Profile photo URL |
| `gender` | enum | ✅ | `MALE`, `FEMALE`, `OTHER` |
| `age` | number | ✅ | Age in years (18-70) |
| `experience` | number | ✅ | Years of cooking experience |

**Skills:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `speciality` | enum | ✅ | `VEG`, `NON_VEG`, `BOTH` |
| `cuisineTypes` | string[] | ✅ | List of cuisines |
| `serviceTypes` | enum[] | ✅ | Types of service offered |

**Pricing:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pricePerVisit` | number | ❌ | Price for single visit |
| `monthlyOneMeal` | number | ❌ | Monthly (1 meal/day) |
| `monthlyTwoMeals` | number | ❌ | Monthly (2 meals/day) |

**Service Area:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceAreas` | string[] | ✅ | Areas where cook can work |
| `city` | string | ✅ | City |
| `pincode` | string | ✅ | Pincode |
| `lat` | number | ✅ | Latitude |
| `lng` | number | ✅ | Longitude |

**Availability:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `availableSlots` | object | ✅ | Morning/evening time slots |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Cook profile registered successfully",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "slug": "sunita-devi-bhopal-mp-nagar-x7k9m",
    "fullName": "Sunita Devi",
    "isActive": true,
    "isVerified": false,
    "viewCount": 0,
    "createdAt": "2026-04-04T09:00:00.000Z"
    // ... full profile
  }
}
```

---

## Browse Cooks

### Request

```http
GET /api/v1/cook?city=Bhopal&speciality=VEG&serviceType=DAILY_COOK&priceMax=400
```

### Query Parameters

| Filter | Type | Values | Description |
|--------|------|--------|-------------|
| `city` | string | Any | Filter by city |
| `area` | string | Any | Filter by service area |
| `speciality` | enum | `VEG`, `NON_VEG`, `BOTH` | Food speciality |
| `cuisine` | string | See cuisine list | Specific cuisine |
| `serviceType` | enum | `ONE_TIME_VISIT`, `DAILY_COOK`, `MONTHLY_SUBSCRIPTION` | Service type |
| `gender` | enum | `MALE`, `FEMALE` | Cook's gender |
| `priceMax` | number | Any | Max price per visit |
| `experienceMin` | number | Years | Minimum experience |
| `verified` | boolean | `true` | Only verified cooks |
| `lat` | number | Latitude | User location |
| `lng` | number | Longitude | User location |
| `sort` | string | `price`, `experience`, `viewCount`, `distance` | Sort field |
| `order` | string | `asc`, `desc` | Sort order |
| `page` | number | ≥1 | Page number |
| `limit` | number | 1-100 | Results per page |

### Response

```json
{
  "success": true,
  "message": "Cooks fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "slug": "sunita-devi-bhopal-mp-nagar-x7k9m",
      "fullName": "Sunita Devi",
      "photo": "https://res.cloudinary.com/...",
      "gender": "FEMALE",
      "age": 45,
      "experience": 15,
      
      "speciality": "BOTH",
      "cuisineTypes": ["NORTH_INDIAN", "SOUTH_INDIAN", "RAJASTHANI", "GUJARATI"],
      "serviceTypes": ["DAILY_COOK", "MONTHLY_SUBSCRIPTION"],
      
      "pricePerVisit": 300,
      "monthlyOneMeal": 4000,
      "monthlyTwoMeals": 7000,
      
      "serviceAreas": ["MP Nagar", "Arera Colony", "Shahpura", "Kolar"],
      "city": "Bhopal",
      "distance": "2.1 km",
      
      "availableSlots": {
        "morning": { "start": "06:00", "end": "10:00" },
        "evening": { "start": "17:00", "end": "21:00" }
      },
      
      "isVerified": true,
      "isFeatured": false,
      "viewCount": 320,
      
      "rating": {
        "average": 4.5,
        "count": 28
      },
      
      "isSaved": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 18,
    "totalPages": 2
  }
}
```

---

## Cook Detail

### Request

```http
GET /api/v1/cook/sunita-devi-bhopal-mp-nagar-x7k9m
```

### Response

```json
{
  "success": true,
  "message": "Cook profile fetched",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "slug": "sunita-devi-bhopal-mp-nagar-x7k9m",
    
    "fullName": "Sunita Devi",
    "photo": "https://res.cloudinary.com/projectx/image/upload/cook_photo.jpg",
    "gender": "FEMALE",
    "age": 45,
    "experience": 15,
    
    "speciality": "BOTH",
    "cuisineTypes": ["NORTH_INDIAN", "SOUTH_INDIAN", "RAJASTHANI", "GUJARATI"],
    "serviceTypes": ["DAILY_COOK", "MONTHLY_SUBSCRIPTION"],
    
    "pricing": {
      "pricePerVisit": 300,
      "monthlyOneMeal": 4000,
      "monthlyTwoMeals": 7000
    },
    
    "serviceAreas": ["MP Nagar", "Arera Colony", "Shahpura", "Kolar", "Habibganj"],
    "city": "Bhopal",
    "pincode": "462011",
    "location": {
      "type": "Point",
      "coordinates": [77.4345, 23.2332]
    },
    
    "availableSlots": {
      "morning": { 
        "start": "06:00", 
        "end": "10:00",
        "description": "Breakfast preparation"
      },
      "evening": { 
        "start": "17:00", 
        "end": "21:00",
        "description": "Lunch & dinner preparation"
      }
    },
    
    "isActive": true,
    "isVerified": true,
    "isFeatured": false,
    "viewCount": 321,
    
    "user": {
      "id": "user_cook_id",
      "name": "Sunita Devi",
      "phone": "+919876543210",
      "profilePhoto": "https://..."
    },
    
    "rating": {
      "average": 4.5,
      "count": 28,
      "distribution": [
        { "rating": 5, "count": 18 },
        { "rating": 4, "count": 7 },
        { "rating": 3, "count": 2 },
        { "rating": 2, "count": 1 },
        { "rating": 1, "count": 0 }
      ]
    },
    
    "isSaved": false,
    
    "recentReviews": [
      {
        "id": "review_001",
        "rating": 5,
        "comment": "Excellent cooking! She makes amazing dal makhani and fresh rotis.",
        "userName": "Rahul Sharma",
        "createdAt": "2026-04-02T14:00:00.000Z"
      },
      {
        "id": "review_002",
        "rating": 5,
        "comment": "Very punctual and hygienic. Highly recommended.",
        "userName": "Priya Patel",
        "createdAt": "2026-03-28T10:00:00.000Z"
      }
    ],
    
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-04-01T15:30:00.000Z"
  }
}
```

---

## Update Cook Profile

### Request

```http
PUT /api/v1/cook/665a1b2c3d4e5f6789012345
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "pricePerVisit": 350,
  "monthlyOneMeal": 4500,
  "serviceAreas": ["MP Nagar", "Arera Colony", "Shahpura", "Kolar", "Habibganj", "BHEL"]
}
```

### Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated cook profile
  }
}
```

---

## Save / Unsave Cook

### Request

```http
POST /api/v1/cook/665a1b2c3d4e5f6789012345/save
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Cook saved",
  "data": {
    "isSaved": true
  }
}
```

---

## Get Saved Cooks

### Request

```http
GET /api/v1/cook/saved
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Saved cooks fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "fullName": "Sunita Devi",
      "photo": "https://...",
      "speciality": "BOTH",
      "pricePerVisit": 350,
      "city": "Bhopal",
      "rating": { "average": 4.5, "count": 28 }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## Cook Dashboard

### Request

```http
GET /api/v1/cook/dashboard
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "profile": {
      "id": "665a1b2c3d4e5f6789012345",
      "fullName": "Sunita Devi",
      "slug": "sunita-devi-bhopal-mp-nagar-x7k9m",
      "isActive": true,
      "isVerified": true
    },
    "stats": {
      "viewCount": 850,
      "savedCount": 45,
      "reviewCount": 28,
      "averageRating": 4.5
    },
    "recentReviews": [
      {
        "id": "review_001",
        "rating": 5,
        "comment": "Excellent cooking!",
        "userName": "Rahul Sharma",
        "createdAt": "2026-04-02T14:00:00.000Z"
      }
    ],
    "analytics": {
      "viewsLast7Days": [32, 45, 38, 52, 41, 35, 48],
      "viewsLast30Days": 850,
      "topViewDays": ["Saturday", "Sunday"]
    }
  }
}
```

---

## Cuisine Types

| Code | Display Name | Region |
|------|--------------|--------|
| `NORTH_INDIAN` | North Indian | Punjab, Delhi, UP |
| `SOUTH_INDIAN` | South Indian | Tamil Nadu, Karnataka |
| `GUJARATI` | Gujarati | Gujarat |
| `RAJASTHANI` | Rajasthani | Rajasthan |
| `BENGALI` | Bengali | West Bengal |
| `MAHARASHTRIAN` | Maharashtrian | Maharashtra |
| `PUNJABI` | Punjabi | Punjab |
| `CHINESE` | Chinese/Indo-Chinese | Pan-India |
| `CONTINENTAL` | Continental | Western |
| `ITALIAN` | Italian | Western |
| `MUGHLAI` | Mughlai | North India |
| `CHETTINAD` | Chettinad | Tamil Nadu |
| `HYDERABADI` | Hyderabadi | Hyderabad |
| `KERALA` | Kerala | Kerala |
| `MALWANI` | Malwani | Coastal Maharashtra |
| `JAIN` | Jain Vegetarian | Pan-India |

---

## Service Types

| Code | Display Name | Description |
|------|--------------|-------------|
| `ONE_TIME_VISIT` | One-Time Visit | Single cooking session (e.g., party) |
| `DAILY_COOK` | Daily Cook | Regular daily cooking |
| `MONTHLY_SUBSCRIPTION` | Monthly Subscription | Monthly package with fixed visits |

---

## Pricing Plans

| Plan | Field | Typical Range | Description |
|------|-------|---------------|-------------|
| Per Visit | `pricePerVisit` | ₹200-500 | Single cooking visit |
| Monthly (1 meal) | `monthlyOneMeal` | ₹3,000-6,000 | One meal/day for month |
| Monthly (2 meals) | `monthlyTwoMeals` | ₹5,000-10,000 | Two meals/day for month |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `COOK_NOT_FOUND` | 404 | Cook profile doesn't exist |
| `COOK_EXISTS` | 409 | User already has a cook profile |
| `NOT_OWNER` | 403 | Not the profile owner |
| `ALREADY_SAVED` | 409 | Already saved |
| `INVALID_SERVICE_AREA` | 400 | Service area not supported |

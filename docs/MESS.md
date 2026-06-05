# 🍽️ Mess / Tiffin Module

## Overview

Discover nearby mess halls and tiffin services. Mess owners can register their establishment, update daily menus, and track performance. Users can browse by location, food type, meal times, and delivery availability.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MESS MODULE ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          USER JOURNEY                               │ │
│  │                                                                     │ │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │ │
│  │  │  Browse   │───▶│  View     │───▶│  Check    │───▶│  Contact  │  │ │
│  │  │  Nearby   │    │  Detail   │    │  Menu     │    │  Owner    │  │ │
│  │  │  Mess     │    │  Pricing  │    │  Today    │    │  via Chat │  │ │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          OWNER JOURNEY                              │ │
│  │                                                                     │ │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │ │
│  │  │ Register  │───▶│  Upload   │───▶│  Update   │───▶│  Track    │  │ │
│  │  │  Mess     │    │  Photos   │    │  Daily    │    │  Analytics│  │ │
│  │  │  Profile  │    │  Pricing  │    │  Menu     │    │  Dashboard│  │ │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        DATABASE MODELS                              │ │
│  │                                                                     │ │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │ │
│  │  │ MessProfile │───▶│  MessMenu   │    │  MessSaved  │             │ │
│  │  │ (1 per user)│    │ (daily menu)│    │ (bookmarks) │             │ │
│  │  └─────────────┘    └─────────────┘    └─────────────┘             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## REST API Endpoints

### Base URL: `/api/v1/mess`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ✅ | Register a new mess |
| `GET` | `/` | ❌ | Browse mess listings |
| `GET` | `/:idOrSlug` | ❌ | Get mess detail |
| `PUT` | `/:id` | ✅ Owner | Update mess info |
| `DELETE` | `/:id` | ✅ Owner | Delete mess |
| `POST` | `/menu` | ✅ Owner | Update today's menu |
| `GET` | `/:id/menu` | ❌ | Get menu for a date |
| `POST` | `/:id/save` | ✅ | Toggle save/unsave |
| `GET` | `/saved` | ✅ | Get saved mess list |
| `GET` | `/dashboard` | ✅ Owner | Owner dashboard |

---

## Register Mess

### Request

```http
POST /api/v1/mess/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Sharma Ji Ka Dhaba",
  "ownerName": "Ramesh Sharma",
  "description": "Authentic home-style vegetarian food. Serving students and working professionals since 2010. Known for our dal tadka and fresh rotis.",
  "photos": [
    "https://res.cloudinary.com/projectx/image/upload/mess_main.jpg",
    "https://res.cloudinary.com/projectx/image/upload/mess_interior.jpg",
    "https://res.cloudinary.com/projectx/image/upload/mess_thali.jpg"
  ],
  
  "address": "Plot 45, Near MANIT Gate, MP Nagar Zone-1",
  "area": "MP Nagar",
  "city": "Bhopal",
  "pincode": "462011",
  "lat": 23.2332,
  "lng": 77.4345,
  
  "foodType": "VEG",
  "mealTypes": ["BREAKFAST", "LUNCH", "DINNER"],
  
  "timings": {
    "breakfast": { "start": "07:30", "end": "10:00" },
    "lunch": { "start": "12:00", "end": "15:00" },
    "dinner": { "start": "19:00", "end": "22:00" }
  },
  
  "pricePerMeal": 60,
  "monthlyOneMeal": 1500,
  "monthlyTwoMeals": 2800,
  "monthlyThreeMeals": 3800,
  "trialMealPrice": 50,
  
  "deliveryAvailable": true,
  "deliveryRadius": 3.5,
  
  "tiffinService": true,
  "seatingCapacity": 30,
  "features": ["HOME_STYLE", "UNLIMITED_ROTI", "AC", "WIFI", "PARKING"]
}
```

### Field Details

**Basic Info:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Mess name (5-100 chars) |
| `ownerName` | string | ✅ | Owner's name |
| `description` | string | ✅ | Description (50-1000 chars) |
| `photos` | string[] | ✅ | 1-10 photo URLs |

**Location:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address` | string | ✅ | Full address |
| `area` | string | ✅ | Area name |
| `city` | string | ✅ | City name |
| `pincode` | string | ✅ | 6-digit pincode |
| `lat` | number | ✅ | Latitude |
| `lng` | number | ✅ | Longitude |

**Food & Timings:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `foodType` | enum | ✅ | `VEG`, `NON_VEG`, `BOTH` |
| `mealTypes` | enum[] | ✅ | `BREAKFAST`, `LUNCH`, `DINNER` |
| `timings` | object | ✅ | Operating hours per meal |

**Pricing:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pricePerMeal` | number | ❌ | Price per single meal |
| `monthlyOneMeal` | number | ❌ | Monthly package (1 meal/day) |
| `monthlyTwoMeals` | number | ❌ | Monthly package (2 meals/day) |
| `monthlyThreeMeals` | number | ❌ | Monthly package (3 meals/day) |
| `trialMealPrice` | number | ❌ | Trial meal price |

**Services:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deliveryAvailable` | boolean | ❌ | Offers delivery |
| `deliveryRadius` | number | ❌ | Delivery radius in km |
| `tiffinService` | boolean | ❌ | Offers tiffin service |
| `seatingCapacity` | number | ❌ | Dine-in capacity |
| `features` | string[] | ❌ | Special features |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Mess registered successfully",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "slug": "sharma-ji-ka-dhaba-bhopal-mp-nagar-x7k9m",
    "name": "Sharma Ji Ka Dhaba",
    "isActive": true,
    "isVerified": false,
    "viewCount": 0,
    "createdAt": "2026-04-04T09:00:00.000Z"
    // ... full mess object
  }
}
```

---

## Browse Mess

### Request

```http
GET /api/v1/mess?city=Bhopal&foodType=VEG&delivery=true&lat=23.2332&lng=77.4345
```

### Query Parameters

| Filter | Type | Values | Description |
|--------|------|--------|-------------|
| `city` | string | Any | Filter by city |
| `area` | string | Any | Filter by area |
| `foodType` | enum | `VEG`, `NON_VEG`, `BOTH` | Food preference |
| `mealType` | enum | `BREAKFAST`, `LUNCH`, `DINNER` | Specific meal |
| `delivery` | boolean | `true` | Only with delivery |
| `tiffin` | boolean | `true` | Only with tiffin service |
| `priceMax` | number | Any | Max price per meal |
| `features` | string | CSV | Features (`HOME_STYLE,UNLIMITED`) |
| `verified` | boolean | `true` | Only verified |
| `lat` | number | Latitude | User location (for proximity) |
| `lng` | number | Longitude | User location |
| `radius` | number | Meters | Max distance |
| `sort` | string | `price`, `viewCount`, `createdAt`, `distance` | Sort field |
| `order` | string | `asc`, `desc` | Sort order |
| `page` | number | ≥1 | Page number |
| `limit` | number | 1-100 | Results per page |

### Response

```json
{
  "success": true,
  "message": "Mess listings fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "slug": "sharma-ji-ka-dhaba-bhopal-mp-nagar-x7k9m",
      "name": "Sharma Ji Ka Dhaba",
      "ownerName": "Ramesh Sharma",
      "description": "Authentic home-style vegetarian food...",
      "photos": ["https://res.cloudinary.com/..."],
      
      "area": "MP Nagar",
      "city": "Bhopal",
      "distance": "1.2 km",
      
      "foodType": "VEG",
      "mealTypes": ["BREAKFAST", "LUNCH", "DINNER"],
      
      "pricePerMeal": 60,
      "monthlyOneMeal": 1500,
      "monthlyTwoMeals": 2800,
      "monthlyThreeMeals": 3800,
      
      "deliveryAvailable": true,
      "deliveryRadius": 3.5,
      "tiffinService": true,
      
      "features": ["HOME_STYLE", "UNLIMITED_ROTI", "AC"],
      
      "isVerified": true,
      "isFeatured": false,
      "viewCount": 450,
      
      "rating": {
        "average": 4.2,
        "count": 47
      },
      
      "isSaved": false,
      
      "todayMenu": {
        "lunch": ["Dal Tadka", "Rice", "Roti", "Aloo Gobi", "Salad"],
        "dinner": null  // Not updated yet
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 28,
    "totalPages": 3
  }
}
```

---

## Mess Detail

### Request

```http
GET /api/v1/mess/sharma-ji-ka-dhaba-bhopal-mp-nagar-x7k9m
```

### Response

```json
{
  "success": true,
  "message": "Mess fetched",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "slug": "sharma-ji-ka-dhaba-bhopal-mp-nagar-x7k9m",
    "name": "Sharma Ji Ka Dhaba",
    "ownerName": "Ramesh Sharma",
    "description": "Authentic home-style vegetarian food. Serving students and working professionals since 2010. Known for our dal tadka and fresh rotis. Clean environment with AC seating. Monthly packages available with flexible options.",
    
    "photos": [
      "https://res.cloudinary.com/projectx/image/upload/mess_main.jpg",
      "https://res.cloudinary.com/projectx/image/upload/mess_interior.jpg",
      "https://res.cloudinary.com/projectx/image/upload/mess_thali.jpg"
    ],
    
    "address": "Plot 45, Near MANIT Gate, MP Nagar Zone-1",
    "area": "MP Nagar",
    "city": "Bhopal",
    "pincode": "462011",
    "location": {
      "type": "Point",
      "coordinates": [77.4345, 23.2332]
    },
    
    "foodType": "VEG",
    "mealTypes": ["BREAKFAST", "LUNCH", "DINNER"],
    
    "timings": {
      "breakfast": { "start": "07:30", "end": "10:00" },
      "lunch": { "start": "12:00", "end": "15:00" },
      "dinner": { "start": "19:00", "end": "22:00" }
    },
    
    "pricing": {
      "pricePerMeal": 60,
      "monthlyOneMeal": 1500,
      "monthlyTwoMeals": 2800,
      "monthlyThreeMeals": 3800,
      "trialMealPrice": 50
    },
    
    "deliveryAvailable": true,
    "deliveryRadius": 3.5,
    "tiffinService": true,
    "seatingCapacity": 30,
    
    "features": ["HOME_STYLE", "UNLIMITED_ROTI", "AC", "WIFI", "PARKING"],
    
    "isActive": true,
    "isVerified": true,
    "isFeatured": false,
    "viewCount": 451,
    
    "owner": {
      "id": "owner_user_id",
      "name": "Ramesh Sharma",
      "phone": "+919876543210",  // Visible to logged-in users
      "profilePhoto": "https://..."
    },
    
    "rating": {
      "average": 4.2,
      "count": 47,
      "distribution": [
        { "rating": 5, "count": 20 },
        { "rating": 4, "count": 15 },
        { "rating": 3, "count": 8 },
        { "rating": 2, "count": 3 },
        { "rating": 1, "count": 1 }
      ]
    },
    
    "isSaved": false,
    
    "todayMenu": {
      "breakfast": {
        "items": ["Poha", "Jalebi", "Chai"],
        "photo": "https://res.cloudinary.com/projectx/image/upload/breakfast_today.jpg"
      },
      "lunch": {
        "items": ["Dal Tadka", "Rice", "Roti", "Aloo Gobi", "Raita", "Salad"],
        "photo": "https://res.cloudinary.com/projectx/image/upload/lunch_today.jpg"
      },
      "dinner": null
    },
    
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-04-04T08:30:00.000Z"
  }
}
```

---

## Update Daily Menu

### Request

```http
POST /api/v1/mess/menu
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "date": "2026-04-04",
  "mealType": "LUNCH",
  "items": ["Dal Tadka", "Rice", "Roti", "Paneer Butter Masala", "Raita", "Salad", "Papad"],
  "photo": "https://res.cloudinary.com/projectx/image/upload/lunch_thali_today.jpg"
}
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | ✅ | Date (YYYY-MM-DD) |
| `mealType` | enum | ✅ | `BREAKFAST`, `LUNCH`, `DINNER` |
| `items` | string[] | ✅ | List of food items |
| `photo` | string | ❌ | Today's thali photo |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Menu updated successfully",
  "data": {
    "id": "menu_001",
    "messId": "665a1b2c3d4e5f6789012345",
    "date": "2026-04-04T00:00:00.000Z",
    "mealType": "LUNCH",
    "items": ["Dal Tadka", "Rice", "Roti", "Paneer Butter Masala", "Raita", "Salad", "Papad"],
    "photo": "https://res.cloudinary.com/...",
    "createdAt": "2026-04-04T10:00:00.000Z"
  }
}
```

**Note:** Menu is upserted — if a menu for the same date + mealType exists, it gets updated.

---

## Get Menu for Date

### Request

```http
GET /api/v1/mess/665a1b2c3d4e5f6789012345/menu?date=2026-04-04
```

### Response

```json
{
  "success": true,
  "message": "Menu fetched",
  "data": {
    "date": "2026-04-04",
    "menus": {
      "breakfast": {
        "items": ["Poha", "Jalebi", "Chai"],
        "photo": "https://res.cloudinary.com/..."
      },
      "lunch": {
        "items": ["Dal Tadka", "Rice", "Roti", "Paneer Butter Masala", "Raita", "Salad", "Papad"],
        "photo": "https://res.cloudinary.com/..."
      },
      "dinner": null  // Not yet updated
    }
  }
}
```

---

## Save / Unsave Mess

### Request

```http
POST /api/v1/mess/665a1b2c3d4e5f6789012345/save
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Mess saved",
  "data": {
    "isSaved": true
  }
}
```

---

## Get Saved Mess

### Request

```http
GET /api/v1/mess/saved
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Saved mess fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Sharma Ji Ka Dhaba",
      "area": "MP Nagar",
      "city": "Bhopal",
      "foodType": "VEG",
      "pricePerMeal": 60,
      "photo": "https://..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## Owner Dashboard

### Request

```http
GET /api/v1/mess/dashboard
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "mess": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Sharma Ji Ka Dhaba",
      "slug": "sharma-ji-ka-dhaba-bhopal-mp-nagar-x7k9m",
      "isActive": true,
      "isVerified": true
    },
    "stats": {
      "viewCount": 1250,
      "savedCount": 89,
      "reviewCount": 47,
      "averageRating": 4.2
    },
    "todayMenu": {
      "breakfast": ["Poha", "Jalebi", "Chai"],
      "lunch": ["Dal Tadka", "Rice", "Roti", "Paneer Butter Masala"],
      "dinner": null
    },
    "recentReviews": [
      {
        "id": "review_001",
        "rating": 5,
        "comment": "Amazing dal and fresh rotis!",
        "userName": "Vikram Singh",
        "createdAt": "2026-04-03T14:00:00.000Z"
      }
    ],
    "analytics": {
      "viewsLast7Days": [45, 52, 48, 60, 55, 42, 58],
      "viewsLast30Days": 1250,
      "topViewDays": ["Monday", "Saturday"]
    }
  }
}
```

---

## Pricing Plans Explained

| Plan | Field | Typical Value | Description |
|------|-------|---------------|-------------|
| Per Meal | `pricePerMeal` | ₹50-80 | Single meal price |
| Monthly (1x) | `monthlyOneMeal` | ₹1,200-2,000 | One meal per day for 30 days |
| Monthly (2x) | `monthlyTwoMeals` | ₹2,200-3,500 | Two meals per day for 30 days |
| Monthly (3x) | `monthlyThreeMeals` | ₹3,000-4,500 | All meals for 30 days |
| Trial | `trialMealPrice` | ₹40-60 | Discounted first meal |

---

## Features List

| Feature Code | Display Name | Description |
|--------------|--------------|-------------|
| `HOME_STYLE` | Home-style Cooking | Traditional home recipes |
| `UNLIMITED_ROTI` | Unlimited Roti | No limit on rotis |
| `UNLIMITED_RICE` | Unlimited Rice | No limit on rice |
| `UNLIMITED_DAL` | Unlimited Dal | No limit on dal |
| `AC` | Air Conditioned | AC seating |
| `WIFI` | Free Wi-Fi | Internet available |
| `PARKING` | Parking | Vehicle parking |
| `HYGIENIC` | Hygienic Kitchen | Clean cooking |
| `QUICK_SERVICE` | Quick Service | Fast service |
| `SUNDAY_SPECIAL` | Sunday Special | Special menu on Sundays |
| `SWEETS_INCLUDED` | Sweets Included | Dessert with meal |
| `GUJARATI_THALI` | Gujarati Thali | Full Gujarati menu |
| `RAJASTHANI_THALI` | Rajasthani Thali | Full Rajasthani menu |
| `PUNJABI_THALI` | Punjabi Thali | Full Punjabi menu |
| `SOUTH_INDIAN` | South Indian | South Indian options |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `MESS_NOT_FOUND` | 404 | Mess doesn't exist |
| `MESS_EXISTS` | 409 | User already has a mess |
| `NOT_OWNER` | 403 | Not the mess owner |
| `ALREADY_SAVED` | 409 | Already saved |
| `INVALID_MEAL_TYPE` | 400 | Invalid meal type |

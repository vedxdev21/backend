# 🏠 Property Module

## Overview

Full-featured **broker-free property rental** system. Users can list rooms/flats, browse with advanced filters, save listings, send inquiries, create alerts, and track analytics. Supports residential, student housing (hostels/PGs), and commercial properties.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PROPERTY MODULE ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          USER ACTIONS                               │ │
│  │                                                                     │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │ │
│  │  │ Browse  │  │ Create  │  │  Save   │  │ Inquiry │  │ Alert   │   │ │
│  │  │ Search  │  │ Listing │  │ Unsave  │  │ Send    │  │ Create  │   │ │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │ │
│  │       │            │            │            │            │        │ │
│  │       └────────────┼────────────┼────────────┼────────────┘        │ │
│  │                    │            │            │                      │ │
│  │                    ▼            ▼            ▼                      │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        PROPERTY SERVICE                             │ │
│  │                                                                     │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │ │
│  │  │ Geo Queries   │  │ Slug Gen      │  │ Analytics Tracking    │   │ │
│  │  │ ($near)       │  │ (unique URLs) │  │ (views, inquiries)    │   │ │
│  │  └───────────────┘  └───────────────┘  └───────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                          DATABASE MODELS                            │ │
│  │                                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │ │
│  │  │  Property   │  │PropertySaved│  │PropertyInq. │  │PropAlert   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## REST API Endpoints

### Base URL: `/api/v1/properties`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | Browse with filters & pagination |
| `POST` | `/` | ✅ | Create new listing |
| `GET` | `/:idOrSlug` | ❌ | Get property detail |
| `PUT` | `/:id` | ✅ Owner | Update listing |
| `DELETE` | `/:id` | ✅ Owner | Soft delete listing |
| `PATCH` | `/:id/status` | ✅ Owner | Update status (rented/paused) |
| `GET` | `/my-listings` | ✅ | Get owner's listings |
| `POST` | `/:id/save` | ✅ | Toggle save/unsave |
| `GET` | `/saved` | ✅ | Get saved properties |
| `POST` | `/:id/inquiry` | ✅ | Send inquiry message |
| `GET` | `/:id/inquiries` | ✅ Owner | Get inquiries received |
| `POST` | `/:id/show-number` | ✅ | Reveal owner's phone |
| `GET` | `/compare` | ❌ | Compare up to 4 properties |
| `POST` | `/alerts` | ✅ | Create price/location alert |
| `GET` | `/alerts` | ✅ | Get my alerts |
| `DELETE` | `/alerts/:id` | ✅ | Delete alert |
| `GET` | `/owner/dashboard` | ✅ | Owner analytics |

---

## Property Types

### Residential

| Type | Description | Typical Rent |
|------|-------------|--------------|
| `SINGLE_ROOM_INDEPENDENT` | Room with separate entrance | ₹3,000-8,000 |
| `SINGLE_ROOM_DEPENDENT` | Room with shared entrance | ₹2,500-6,000 |
| `SHARED_ROOM` | Shared room (2-4 beds) | ₹2,000-4,000 |
| `ONE_RK` | 1 Room + Kitchen (studio) | ₹5,000-12,000 |
| `ONE_BHK` | 1 Bed + Hall + Kitchen | ₹8,000-20,000 |
| `TWO_BHK` | 2 Bed + Hall + Kitchen | ₹12,000-35,000 |
| `THREE_BHK` | 3 Bed + Hall + Kitchen | ₹18,000-50,000 |
| `DUPLEX` | Two-floor apartment | ₹25,000-80,000 |

### Student Housing

| Type | Description | Typical Rent |
|------|-------------|--------------|
| `HOSTEL_BOYS` | Boys hostel (shared facilities) | ₹3,000-8,000 |
| `HOSTEL_GIRLS` | Girls hostel (shared facilities) | ₹3,000-8,000 |
| `PG` | Paying Guest (meals included) | ₹5,000-15,000 |

### Commercial

| Type | Description | Typical Rent |
|------|-------------|--------------|
| `SHOP` | Retail shop space | ₹10,000-100,000 |
| `OFFICE` | Office space | ₹15,000-150,000 |
| `GODOWN` | Warehouse/storage | ₹8,000-50,000 |
| `CLINIC` | Medical clinic space | ₹15,000-80,000 |
| `RESTAURANT_SPACE` | Restaurant/cafe space | ₹20,000-200,000 |
| `PARKING` | Parking space | ₹1,000-5,000 |

---

## Browse & Search

### Request

```http
GET /api/v1/properties?city=Bhopal&type=TWO_BHK&budgetMin=10000&budgetMax=20000&page=1&limit=12
Authorization: Bearer <token>  (optional - for personalized results)
x-language: en
```

### Query Parameters

| Filter | Type | Values | Description |
|--------|------|--------|-------------|
| `city` | string | Any city | Filter by city name |
| `area` | string | Any area | Filter by area within city |
| `type` | enum | See Property Types | Filter by property type |
| `category` | enum | `RESIDENTIAL`, `STUDENT`, `COMMERCIAL` | Filter by category |
| `furnishing` | enum | `FURNISHED`, `SEMI_FURNISHED`, `UNFURNISHED` | Furnishing level |
| `availableFor` | enum | `BOYS_ONLY`, `GIRLS_ONLY`, `BOTH`, `FAMILY_ONLY`, etc. | Tenant type |
| `budgetMin` | number | Any | Minimum rent |
| `budgetMax` | number | Any | Maximum rent |
| `amenities` | string | CSV | Filter by amenities (`WIFI,AC,PARKING`) |
| `verified` | boolean | `true` | Only admin-verified listings |
| `featured` | boolean | `true` | Only featured listings |
| `lat` | number | Latitude | User's latitude (for proximity sort) |
| `lng` | number | Longitude | User's longitude |
| `radius` | number | Meters | Max distance (default: 10km) |
| `sort` | string | `rent`, `viewCount`, `createdAt` | Sort field |
| `order` | string | `asc`, `desc` | Sort order |
| `page` | number | ≥1 | Page number |
| `limit` | number | 1-100 | Results per page (default: 12) |

### Response

```json
{
  "success": true,
  "message": "Properties fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "title": "Spacious 2BHK in MP Nagar",
      "slug": "spacious-2bhk-mp-nagar-bhopal-x7k9m",
      "propertyType": "TWO_BHK",
      "category": "RESIDENTIAL",
      "availableFor": "FAMILY_ONLY",
      
      "rent": 15000,
      "deposit": 30000,
      "negotiable": "SLIGHTLY_NEGOTIABLE",
      "maintenanceExtra": true,
      "maintenanceAmount": 1500,
      
      "furnishing": "SEMI_FURNISHED",
      "amenities": ["WIFI", "AC", "PARKING", "GYM", "LIFT", "SECURITY"],
      
      "address": "Plot 45, Zone-1",
      "area": "MP Nagar",
      "city": "Bhopal",
      "pincode": "462011",
      "nearLandmark": "Near DB Mall",
      "distance": "2.3 km",  // Only if lat/lng provided
      
      "photos": [
        "https://res.cloudinary.com/projectx/image/upload/v1/prop_1_main.jpg",
        "https://res.cloudinary.com/projectx/image/upload/v1/prop_1_room1.jpg"
      ],
      
      "status": "ACTIVE",
      "isVerified": true,
      "isFeatured": false,
      "viewCount": 234,
      
      "owner": {
        "id": "owner_user_id",
        "name": "Ramesh Sharma",
        "profilePhoto": "https://res.cloudinary.com/..."
      },
      
      "isSaved": true,  // Only if authenticated
      
      "createdAt": "2026-04-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 156,
    "totalPages": 13
  }
}
```

---

## Create Property

### Request

```http
POST /api/v1/properties
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Spacious 2BHK Near DB Mall",
  "description": "Well-maintained 2BHK apartment with modern amenities...",
  "propertyType": "TWO_BHK",
  "category": "RESIDENTIAL",
  "availableFor": "FAMILY_ONLY",
  "dependency": "Independent",
  
  "rent": 15000,
  "deposit": 30000,
  "negotiable": "SLIGHTLY_NEGOTIABLE",
  "maintenanceExtra": true,
  "maintenanceAmount": 1500,
  "minimumStay": "ELEVEN_MONTHS",
  "availableFrom": "2026-05-01",
  
  "furnishing": "SEMI_FURNISHED",
  "amenities": ["WIFI", "AC", "PARKING", "GYM", "LIFT", "SECURITY"],
  "specialRules": "No pets, no smoking",
  
  "address": "Plot 45, Zone-1, MP Nagar",
  "area": "MP Nagar",
  "city": "Bhopal",
  "pincode": "462011",
  "lat": 23.2332,
  "lng": 77.4345,
  "nearLandmark": "Near DB Mall",
  
  "photos": [
    "https://res.cloudinary.com/projectx/image/upload/v1/prop_main.jpg",
    "https://res.cloudinary.com/projectx/image/upload/v1/prop_room1.jpg"
  ],
  "videoTourUrl": "https://youtube.com/watch?v=..."
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, 10-100 chars |
| `description` | Required, 50-2000 chars |
| `propertyType` | Required, valid enum |
| `category` | Required, valid enum |
| `availableFor` | Required, valid enum |
| `rent` | Required, positive integer |
| `deposit` | Optional, positive integer |
| `furnishing` | Required, valid enum |
| `amenities` | Optional, array of strings |
| `address` | Required, 10-200 chars |
| `area` | Required |
| `city` | Required |
| `pincode` | Required, 6 digits |
| `lat` | Required, valid latitude |
| `lng` | Required, valid longitude |
| `photos` | Required, 1-10 URLs |
| `availableFrom` | Required, future date |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "slug": "spacious-2bhk-near-db-mall-bhopal-x7k9m",
    "status": "PENDING_REVIEW",
    "isVerified": false,
    "createdAt": "2026-04-04T09:00:00.000Z"
    // ... full property object
  }
}
```

---

## Property Detail

### Request

```http
GET /api/v1/properties/spacious-2bhk-near-db-mall-bhopal-x7k9m
```

Or by ID:
```http
GET /api/v1/properties/665a1b2c3d4e5f6789012345
```

### Response

```json
{
  "success": true,
  "message": "Property fetched",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "title": "Spacious 2BHK Near DB Mall",
    "slug": "spacious-2bhk-near-db-mall-bhopal-x7k9m",
    "description": "Well-maintained 2BHK apartment with modern amenities. The flat has a spacious living room, two bedrooms with attached bathrooms, modular kitchen, and a balcony with city view...",
    
    "propertyType": "TWO_BHK",
    "category": "RESIDENTIAL",
    "availableFor": "FAMILY_ONLY",
    "dependency": "Independent",
    
    "rent": 15000,
    "deposit": 30000,
    "negotiable": "SLIGHTLY_NEGOTIABLE",
    "maintenanceExtra": true,
    "maintenanceAmount": 1500,
    "minimumStay": "ELEVEN_MONTHS",
    "availableFrom": "2026-05-01T00:00:00.000Z",
    
    "furnishing": "SEMI_FURNISHED",
    "amenities": ["WIFI", "AC", "PARKING", "GYM", "LIFT", "SECURITY", "POWER_BACKUP", "WATER_SUPPLY_24H"],
    "specialRules": "No pets, no smoking",
    
    "address": "Plot 45, Zone-1, MP Nagar",
    "area": "MP Nagar",
    "city": "Bhopal",
    "pincode": "462011",
    "location": {
      "type": "Point",
      "coordinates": [77.4345, 23.2332]
    },
    "nearLandmark": "Near DB Mall",
    
    "photos": [
      "https://res.cloudinary.com/projectx/image/upload/v1/prop_main.jpg",
      "https://res.cloudinary.com/projectx/image/upload/v1/prop_room1.jpg",
      "https://res.cloudinary.com/projectx/image/upload/v1/prop_room2.jpg",
      "https://res.cloudinary.com/projectx/image/upload/v1/prop_kitchen.jpg"
    ],
    "videoTourUrl": "https://youtube.com/watch?v=abc123",
    
    "status": "ACTIVE",
    "isVerified": true,
    "isFeatured": false,
    "viewCount": 235,  // Incremented by this request
    
    "owner": {
      "id": "owner_user_id",
      "name": "Ramesh Sharma",
      "profilePhoto": "https://res.cloudinary.com/...",
      "isPhoneVerified": true
    },
    
    "isSaved": true,
    "hasInquired": false,
    "hasViewedNumber": false,
    
    "stats": {
      "savedCount": 45,
      "inquiryCount": 12,
      "numberViewCount": 8
    },
    
    "createdAt": "2026-04-01T10:00:00.000Z",
    "updatedAt": "2026-04-03T15:30:00.000Z"
  }
}
```

**Note:** `viewCount` is incremented each time the detail endpoint is called (deduplicated by user session).

---

## Update Property

### Request

```http
PUT /api/v1/properties/665a1b2c3d4e5f6789012345
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "rent": 14000,
  "description": "Updated description...",
  "amenities": ["WIFI", "AC", "PARKING", "GYM", "LIFT", "SECURITY", "CCTV"]
}
```

**Note:** Only the owner can update. Partial updates allowed.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Property updated successfully",
  "data": {
    // Updated property object
  }
}
```

---

## Update Status

### Request

```http
PATCH /api/v1/properties/665a1b2c3d4e5f6789012345/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "RENTED"
}
```

**Valid Status Transitions:**

| From | Allowed To |
|------|------------|
| `DRAFT` | `PENDING_REVIEW` |
| `PENDING_REVIEW` | `ACTIVE`, `REJECTED` (admin only) |
| `ACTIVE` | `RENTED`, `DRAFT` |
| `RENTED` | `ACTIVE` |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Property marked as rented",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "status": "RENTED"
  }
}
```

---

## Delete Property

### Request

```http
DELETE /api/v1/properties/665a1b2c3d4e5f6789012345
Authorization: Bearer <access_token>
```

**Note:** Soft delete - sets `isDeleted: true`. Property is hidden from search but data is preserved.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Property deleted successfully",
  "data": null
}
```

---

## Save / Unsave Property

### Request

```http
POST /api/v1/properties/665a1b2c3d4e5f6789012345/save
Authorization: Bearer <access_token>
```

**Note:** Toggle action - if already saved, it unsaves.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Property saved",  // or "Property unsaved"
  "data": {
    "isSaved": true  // or false
  }
}
```

---

## Get Saved Properties

### Request

```http
GET /api/v1/properties/saved?page=1&limit=12
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Saved properties fetched",
  "data": [
    // Array of property objects
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 8,
    "totalPages": 1
  }
}
```

---

## Send Inquiry

### Request

```http
POST /api/v1/properties/665a1b2c3d4e5f6789012345/inquiry
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Hi, I'm interested in this property. Is it still available? When can I visit?"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Inquiry sent successfully",
  "data": {
    "id": "inquiry_id",
    "propertyId": "665a1b2c3d4e5f6789012345",
    "message": "Hi, I'm interested in this property...",
    "createdAt": "2026-04-04T09:30:00.000Z"
  }
}
```

**Side Effects:**
- Owner receives notification
- Can only send one inquiry per property

---

## Get Inquiries (Owner)

### Request

```http
GET /api/v1/properties/665a1b2c3d4e5f6789012345/inquiries?page=1&limit=20
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Inquiries fetched",
  "data": [
    {
      "id": "inquiry_001",
      "message": "Hi, I'm interested in this property...",
      "isRead": false,
      "createdAt": "2026-04-04T09:30:00.000Z",
      "user": {
        "id": "user_123",
        "name": "Vikram Singh",
        "phone": "+919876543210",  // Shown to owner
        "profilePhoto": "https://..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

## Show Owner Number

### Request

```http
POST /api/v1/properties/665a1b2c3d4e5f6789012345/show-number
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Contact number revealed",
  "data": {
    "ownerName": "Ramesh Sharma",
    "phone": "+919876543210"
  }
}
```

**Side Effects:**
- Creates `PropertyNumberView` record
- Increments `numberViewCount` for analytics
- Owner can see who viewed their number

---

## Compare Properties

### Request

```http
GET /api/v1/properties/compare?ids=id1,id2,id3,id4
```

**Note:** Maximum 4 properties can be compared.

### Response

```json
{
  "success": true,
  "message": "Properties fetched for comparison",
  "data": [
    {
      "id": "id1",
      "title": "2BHK in MP Nagar",
      "rent": 15000,
      "deposit": 30000,
      "furnishing": "SEMI_FURNISHED",
      "amenities": ["WIFI", "AC", "PARKING"],
      "area": "MP Nagar",
      "photos": ["https://..."],
      // Other comparable fields
    },
    {
      "id": "id2",
      // ...
    }
  ]
}
```

---

## Property Alerts

### Create Alert

```http
POST /api/v1/properties/alerts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "city": "Bhopal",
  "area": "MP Nagar",           // Optional
  "propertyType": "TWO_BHK",    // Optional
  "availableFor": "BOTH",       // Optional
  "furnishing": "FURNISHED",    // Optional
  "budgetMin": 10000,           // Optional
  "budgetMax": 20000            // Optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Alert created successfully",
  "data": {
    "id": "alert_id",
    "city": "Bhopal",
    "area": "MP Nagar",
    "propertyType": "TWO_BHK",
    "budgetMin": 10000,
    "budgetMax": 20000,
    "isActive": true,
    "createdAt": "2026-04-04T09:00:00.000Z"
  }
}
```

**How It Works:**
- When a new property is listed matching criteria, user gets notified
- Alerts run on property creation/approval
- User can have multiple alerts

### Get My Alerts

```http
GET /api/v1/properties/alerts
Authorization: Bearer <access_token>
```

### Delete Alert

```http
DELETE /api/v1/properties/alerts/alert_id
Authorization: Bearer <access_token>
```

---

## Owner Dashboard

### Request

```http
GET /api/v1/properties/owner/dashboard
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "summary": {
      "totalListings": 5,
      "activeListings": 3,
      "rentedListings": 2,
      "totalViews": 1250,
      "totalInquiries": 45,
      "totalSaves": 89,
      "totalNumberViews": 23
    },
    "listings": [
      {
        "id": "prop_1",
        "title": "2BHK in MP Nagar",
        "status": "ACTIVE",
        "rent": 15000,
        "viewCount": 450,
        "inquiryCount": 18,
        "savedCount": 35,
        "numberViewCount": 12,
        "photo": "https://...",
        "createdAt": "2026-03-15T10:00:00.000Z"
      },
      {
        "id": "prop_2",
        "title": "Single Room in Arera",
        "status": "RENTED",
        // ...
      }
    ],
    "recentInquiries": [
      {
        "id": "inq_1",
        "propertyTitle": "2BHK in MP Nagar",
        "userName": "Vikram Singh",
        "message": "Is this available?",
        "isRead": false,
        "createdAt": "2026-04-04T08:00:00.000Z"
      }
    ]
  }
}
```

---

## Amenities List

Standard amenities recognized by the system:

| Code | Display Name |
|------|--------------|
| `WIFI` | Wi-Fi Internet |
| `AC` | Air Conditioning |
| `PARKING` | Parking |
| `GYM` | Gym/Fitness Center |
| `LIFT` | Lift/Elevator |
| `SECURITY` | 24/7 Security |
| `POWER_BACKUP` | Power Backup |
| `WATER_SUPPLY_24H` | 24/7 Water Supply |
| `GEYSER` | Geyser/Water Heater |
| `WASHING_MACHINE` | Washing Machine |
| `REFRIGERATOR` | Refrigerator |
| `TV` | Television |
| `SOFA` | Sofa Set |
| `BED` | Bed |
| `WARDROBE` | Wardrobe |
| `DINING_TABLE` | Dining Table |
| `GAS_STOVE` | Gas Stove/Connection |
| `MICROWAVE` | Microwave Oven |
| `CCTV` | CCTV Surveillance |
| `SWIMMING_POOL` | Swimming Pool |
| `GARDEN` | Garden/Park |
| `PLAY_AREA` | Children's Play Area |
| `CLUB_HOUSE` | Club House |
| `FIRE_SAFETY` | Fire Safety |
| `INTERCOM` | Intercom Facility |
| `PIPED_GAS` | Piped Gas |
| `RO_WATER` | RO Water Purifier |
| `BALCONY` | Balcony |
| `SERVANT_ROOM` | Servant Room |
| `STUDY_ROOM` | Study Room |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `PROPERTY_NOT_FOUND` | 404 | Property doesn't exist |
| `NOT_OWNER` | 403 | Not the property owner |
| `ALREADY_INQUIRED` | 409 | Already sent inquiry |
| `ALREADY_SAVED` | 409 | Already saved |
| `MAX_PHOTOS_EXCEEDED` | 400 | More than 10 photos |
| `INVALID_STATUS_TRANSITION` | 400 | Can't change to that status |

---

## My Listings

### Request

```http
GET /api/v1/properties/my-listings?status=ACTIVE&page=1&limit=12
Authorization: Bearer <access_token>
```

### Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `status` | enum | Filter by status |
| `page` | number | Page number |
| `limit` | number | Results per page |

### Response

```json
{
  "success": true,
  "message": "My listings fetched",
  "data": [
    // Array of property objects with full details
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "totalPages": 1
  }
}
```

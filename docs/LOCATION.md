# 📍 Location System — How It Works

## Overview

ProjectX is fundamentally a **location-first** platform. Every listing (property, mess, cook, roommate) stores its position as a **GeoJSON Point**, and browse/search queries use MongoDB's `2dsphere` index to return results sorted by **proximity to the user**.

---

## How Location Works — Step by Step

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   USER       │     │    FRONTEND      │     │     BACKEND      │
│   opens app  │────▶│  GPS / Manual    │────▶│  Store GeoJSON   │
│              │     │  location pick   │     │  Query $near     │
└─────────────┘     └──────────────────┘     └──────────────────┘
```

### 1. User Location Detection
```
Frontend calls: navigator.geolocation.getCurrentPosition()
       OR: User manually selects city + area from dropdown
```

### 2. Send to Backend
```http
PUT /api/v1/users/me/location
{
  "lat": 23.2332,
  "lng": 77.4345,
  "city": "Bhopal",
  "area": "MP Nagar"
}
```

### 3. Backend Stores as GeoJSON
```typescript
// src/utils/geo.util.ts
export const createGeoPoint = (lat: number, lng: number) => ({
  type: 'Point',
  coordinates: [lng, lat],  // ⚠️ GeoJSON is [longitude, latitude]
});
```

**Stored in MongoDB:**
```json
{
  "location": {
    "type": "Point",
    "coordinates": [77.4345, 23.2332]
  }
}
```

### 4. Proximity Queries
```typescript
// src/utils/geo.util.ts
export const buildNearQuery = (lat: number, lng: number, maxDistanceMeters = 10000) => ({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: maxDistanceMeters,
    },
  },
});
```

### 5. Results Sorted by Distance
The `$near` operator automatically sorts results from **nearest to farthest**.

---

## GeoJSON Format

MongoDB uses the **GeoJSON** standard for geospatial data:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

> ⚠️ **Important:** GeoJSON puts **longitude first**, then latitude. This is the opposite of Google Maps which uses `(lat, lng)`.

| Source | Format |
|--------|--------|
| Google Maps | `(23.2332, 77.4345)` — lat, lng |
| GeoJSON | `[77.4345, 23.2332]` — lng, lat |
| Our API accepts | `{ lat: 23.2332, lng: 77.4345 }` — we convert internally |

---

## MongoDB Indexes

For `$near` queries to work, collections need a `2dsphere` index on their `location` field:

```javascript
// Created by: npm run setup:indexes
// scripts/create-indexes.ts

db.Property.createIndex({ location: "2dsphere" });
db.MessProfile.createIndex({ location: "2dsphere" });
db.CookProfile.createIndex({ location: "2dsphere" });
db.RoommateProfile.createIndex({ location: "2dsphere" });
db.User.createIndex({ location: "2dsphere" });
```

Without these indexes, `$near` queries will fail with an error.

---

## Supported Cities (21)

The location service provides pre-configured city and area data:

| City | Areas | Coordinates |
|------|-------|------------|
| Bhopal | MP Nagar, Arera Colony, Shahpura, Kolar, Misrod, BHEL, Habibganj, Bairagarh | 23.2599, 77.4126 |
| Indore | Vijay Nagar, Palasia, MG Road, Rau, Bhawarkua, Rajwada, Sapna Sangeeta | 22.7196, 75.8577 |
| Delhi NCR | Connaught Place, Rajouri Garden, Saket, Dwarka, Noida, Gurgaon | 28.6139, 77.2090 |
| Mumbai | Andheri, Bandra, Powai, Dadar, Borivali, Lower Parel, BKC | 19.0760, 72.8777 |
| Bangalore | Koramangala, HSR Layout, Indiranagar, Whitefield, Electronic City | 12.9716, 77.5946 |
| Pune | Kothrud, Hinjewadi, Viman Nagar, Shivaji Nagar, Baner | 18.5204, 73.8567 |
| ... and 15 more | | |

---

## City/Area APIs

### Get All Cities
```http
GET /api/v1/location/cities
```
```json
{
  "success": true,
  "data": [
    { "name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126 },
    { "name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lng": 75.8577 }
  ]
}
```

### Get Areas for City
```http
GET /api/v1/location/cities/Bhopal/areas
```
```json
{
  "data": [
    { "name": "MP Nagar", "lat": 23.2332, "lng": 77.4345, "pincode": "462011" },
    { "name": "Arera Colony", "lat": 23.2100, "lng": 77.4300, "pincode": "462016" }
  ]
}
```

### Auto-Detect Location
```http
POST /api/v1/location/detect
{ "lat": 23.2332, "lng": 77.4345 }
```
Returns nearest matching city and area based on coordinates.

### Area Guide
```http
GET /api/v1/location/area-guide/Bhopal
```
Returns areas with metadata useful for the frontend (popular areas, property density, etc.)

---

## Distance Calculation

The backend includes a **Haversine formula** for calculating distances:

```typescript
// src/utils/geo.util.ts
export const haversineDistance = (lat1, lng1, lat2, lng2): number => {
  const R = 6371; // Earth's radius in km
  // ... formula returns distance in km
};

export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
};
```

This is used for:
- Showing "2.3 km away" on listings
- Delivery radius checks for mess/cook
- Roommate area proximity scoring

---

## How Location is Used in Each Module

| Module | Location Usage |
|--------|---------------|
| **Property** | Store property coordinates → Browse shows nearest listings first |
| **Mess** | Store mess location → Filter by city/area → Delivery radius check |
| **Cook** | Store cook's home → Show cooks who service user's area |
| **Roommate** | Store preferred area → Location match scoring (10% weight) |
| **User** | Store user's current position → Used as center point for all queries |

---

## Frontend Integration Guide

### Step 1: Get User Location
```javascript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude: lat, longitude: lng } = pos.coords;
    // Send to backend
  },
  (err) => {
    // Fallback: show city selector dropdown
  }
);
```

### Step 2: Update Backend
```javascript
await fetch('/api/v1/users/me/location', {
  method: 'PUT',
  body: JSON.stringify({ lat, lng, city: 'Bhopal', area: 'MP Nagar' }),
});
```

### Step 3: Browse Listings
```javascript
// Properties near user's location are automatically sorted by proximity
const res = await fetch('/api/v1/properties?city=Bhopal&lat=23.23&lng=77.43');
```

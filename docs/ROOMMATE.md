# 🤝 Roommate Finder Module

## Overview

AI-powered roommate matching with a **10-factor compatibility algorithm**. Users create lifestyle profiles and get matched based on food, smoking, budget, sleep schedule, and more. Includes interest system, connections, and groups.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      ROOMMATE MATCHING ARCHITECTURE                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        USER A PROFILE                               │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ food: VEG          │ smoking: NO        │ budget: 5k-10k    │   │ │
│  │  │ drinking: OCCASIONAL│ sleep: EARLY_BIRD  │ clean: VERY_CLEAN │   │ │
│  │  │ location: Bhopal    │ profession: STUDENT│ personality: INTRO│   │ │
│  │  │ gender_pref: SAME   │                    │                   │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    MATCHING ALGORITHM                               │ │
│  │                                                                     │ │
│  │   Factor      │ Weight │ Match Logic                                │ │
│  │  ─────────────┼────────┼────────────────────────────────────────── │ │
│  │   🥘 Food      │  15%   │ Same preference OR either is "BOTH"       │ │
│  │   🚬 Smoking   │  15%   │ Must match exactly                        │ │
│  │   💰 Budget    │  15%   │ Ranges overlap                            │ │
│  │   🍺 Drinking  │  10%   │ Must match exactly                        │ │
│  │   😴 Sleep     │  10%   │ Same schedule                             │ │
│  │   🧹 Clean     │  10%   │ Same OR either is "FLEXIBLE"              │ │
│  │   📍 Location  │  10%   │ Same city = 50%, Same area = 100%         │ │
│  │   💼 Profession│   5%   │ Same profession type                      │ │
│  │   🧠 Personality│  5%   │ Same OR either is "AMBIVERT"              │ │
│  │   👫 Gender Pref│  5%   │ "ANY" matches all, "SAME" requires match  │ │
│  │  ─────────────┴────────┴────────────────────────────────────────── │ │
│  │                         Total: 100%                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        COMPATIBILITY SCORE                          │ │
│  │                                                                     │ │
│  │   Score: 78/100  │  Label: "Good Match" 👍                          │ │
│  │                                                                     │ │
│  │   80-100: ✅ Great Match                                            │ │
│  │   60-79:  👍 Good Match                                             │ │
│  │   0-59:   🤝 Fair Match                                             │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Interest Flow

```
┌─────────────┐                              ┌─────────────┐
│   USER A    │                              │   USER B    │
├─────────────┤                              ├─────────────┤
│             │  1. Browse profiles          │             │
│             │     (with compatibility)     │             │
│             │                              │             │
│             │  2. Send Interest            │             │
│             │ ─────────────────────────────▶             │
│             │  "Hey, I saw your profile.   │             │
│             │   Want to be roommates?"     │  Receives   │
│             │                              │  notification│
│             │                              │             │
│             │  3. User B Reviews           │             │
│             │                              │             │
│             │                              │  ┌────────┐ │
│             │  4a. Accept                  │  │ Accept │ │
│             │ ◀─────────────────────────────  │ Decline│ │
│             │                              │  └────────┘ │
│             │                              │             │
│  NOW CONNECTIONS! 🎉                       │             │
│  Can chat via Chat module                  │             │
│             │                              │             │
│             │  4b. Decline                 │             │
│             │ ◀─────────────────────────────             │
│             │  Interest closed             │             │
└─────────────┘                              └─────────────┘
```

---

## REST API Endpoints

### Base URL: `/api/v1/roommate`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Browse profiles with compatibility scores |
| `GET` | `/:id` | ✅ | View profile detail + compatibility |
| `POST` | `/profile` | ✅ | Create roommate profile |
| `PUT` | `/profile` | ✅ | Update profile |
| `DELETE` | `/profile` | ✅ | Delete profile |
| `POST` | `/:id/interest` | ✅ | Send interest to profile |
| `GET` | `/interests` | ✅ | Get sent & received interests |
| `PUT` | `/interests/:id/respond` | ✅ | Accept or decline interest |
| `GET` | `/connections` | ✅ | Get accepted connections |
| `GET` | `/groups` | ✅ | Browse roommate groups |
| `POST` | `/groups` | ✅ | Create a group |
| `POST` | `/groups/:id/join` | ✅ | Join group |
| `DELETE` | `/groups/:id/leave` | ✅ | Leave group |

---

## Create Roommate Profile

### Request

```http
POST /api/v1/roommate/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "photo": "https://res.cloudinary.com/projectx/image/upload/v1/profile.jpg",
  "age": 24,
  "gender": "MALE",
  "profession": "WORKING",
  "companyName": "TCS",
  
  "food": "VEG",
  "smoking": "NO",
  "drinking": "OCCASIONAL",
  "sleep": "EARLY_BIRD",
  "personality": "AMBIVERT",
  "petFriendly": false,
  "cleanliness": "VERY_CLEAN",
  "guests": "SOMETIMES",
  "noise": "PREFER_QUIET",
  
  "budgetMin": 5000,
  "budgetMax": 10000,
  "preferredAreas": ["MP Nagar", "Arera Colony", "Shahpura"],
  "moveInDate": "2026-05-01",
  "duration": "SIX_TO_TWELVE_MONTHS",
  "roomPreferences": ["Attached bathroom", "Balcony", "Furnished"],
  "preferredGender": "SAME",
  
  "bio": "Software developer at TCS, looking for a clean and quiet roommate. I work regular hours and prefer a peaceful environment. Love cooking on weekends!",
  
  "hasRoom": false,
  
  "city": "Bhopal",
  "area": "MP Nagar",
  "lat": 23.2332,
  "lng": 77.4345
}
```

### Profile Fields Explained

**Personal Info:**

| Field | Type | Description |
|-------|------|-------------|
| `photo` | string | Profile photo URL (required) |
| `age` | number | Age in years (18-60) |
| `gender` | enum | `MALE`, `FEMALE`, `OTHER` |
| `profession` | enum | `STUDENT`, `WORKING`, `FREELANCER`, `BUSINESS` |
| `collegeName` | string | College name (if student) |
| `companyName` | string | Company name (if working) |

**Lifestyle Preferences:**

| Field | Type | Values | Used for Matching |
|-------|------|--------|-------------------|
| `food` | enum | `VEG`, `NON_VEG`, `BOTH` | ✅ 15% weight |
| `smoking` | enum | `NO`, `YES` | ✅ 15% weight |
| `drinking` | enum | `NO`, `OCCASIONAL`, `REGULAR` | ✅ 10% weight |
| `sleep` | enum | `EARLY_BIRD`, `NIGHT_OWL` | ✅ 10% weight |
| `personality` | enum | `INTROVERT`, `EXTROVERT`, `AMBIVERT` | ✅ 5% weight |
| `petFriendly` | boolean | true/false | Display only |
| `cleanliness` | enum | `VERY_CLEAN`, `NORMAL`, `FLEXIBLE` | ✅ 10% weight |
| `guests` | enum | `OKAY`, `SOMETIMES`, `NOT_OKAY` | Display only |
| `noise` | enum | `OKAY`, `PREFER_QUIET` | Display only |

**Housing Preferences:**

| Field | Type | Description |
|-------|------|-------------|
| `budgetMin` | number | Minimum budget (₹) |
| `budgetMax` | number | Maximum budget (₹) |
| `preferredAreas` | string[] | Preferred areas to live |
| `moveInDate` | date | When looking to move |
| `duration` | enum | How long planning to stay |
| `roomPreferences` | string[] | Room feature preferences |
| `preferredGender` | enum | `SAME`, `ANY` |

**If User Has a Room:**

| Field | Type | Description |
|-------|------|-------------|
| `hasRoom` | boolean | User has room to share |
| `roomAddress` | string | Room address |
| `roomArea` | string | Room area |
| `rentPerPerson` | number | Rent per person |
| `occupants` | number | Current occupants |
| `roomPhotos` | string[] | Room photos |
| `roomAmenities` | string[] | Room amenities |

### Response (201 Created)

```json
{
  "success": true,
  "message": "Roommate profile created",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "userId": "user_id",
    "photo": "https://res.cloudinary.com/...",
    "age": 24,
    "gender": "MALE",
    // ... full profile
    "isActive": true,
    "isVerified": false,
    "viewCount": 0,
    "createdAt": "2026-04-04T09:00:00.000Z"
  }
}
```

---

## Browse Profiles

### Request

```http
GET /api/v1/roommate?city=Bhopal&budgetMin=5000&budgetMax=15000&page=1&limit=12
Authorization: Bearer <access_token>
```

### Query Parameters

| Filter | Type | Description |
|--------|------|-------------|
| `city` | string | Filter by city |
| `area` | string | Filter by area |
| `gender` | enum | Filter by gender |
| `profession` | enum | Filter by profession |
| `food` | enum | Filter by food preference |
| `smoking` | enum | Filter by smoking preference |
| `budgetMin` | number | Minimum budget |
| `budgetMax` | number | Maximum budget |
| `hasRoom` | boolean | Only profiles with rooms |
| `sort` | string | `compatibility`, `createdAt`, `viewCount` |
| `page` | number | Page number |
| `limit` | number | Results per page |

### Response

```json
{
  "success": true,
  "message": "Profiles fetched",
  "data": [
    {
      "id": "profile_001",
      "photo": "https://res.cloudinary.com/...",
      "age": 25,
      "gender": "MALE",
      "profession": "WORKING",
      "companyName": "Infosys",
      
      "food": "VEG",
      "smoking": "NO",
      "drinking": "NO",
      "sleep": "EARLY_BIRD",
      "cleanliness": "VERY_CLEAN",
      
      "budgetMin": 6000,
      "budgetMax": 12000,
      "preferredAreas": ["MP Nagar", "Arera Colony"],
      "duration": "SIX_TO_TWELVE_MONTHS",
      
      "bio": "Software engineer looking for a like-minded roommate...",
      "hasRoom": false,
      
      "city": "Bhopal",
      "area": "MP Nagar",
      
      "isVerified": true,
      "viewCount": 156,
      
      "user": {
        "id": "user_123",
        "name": "Rahul Sharma"
      },
      
      "compatibility": {
        "score": 85,
        "label": "Great Match",
        "breakdown": {
          "food": { "match": true, "weight": 15, "earned": 15 },
          "smoking": { "match": true, "weight": 15, "earned": 15 },
          "budget": { "match": true, "weight": 15, "earned": 15 },
          "drinking": { "match": false, "weight": 10, "earned": 0 },
          "sleep": { "match": true, "weight": 10, "earned": 10 },
          "cleanliness": { "match": true, "weight": 10, "earned": 10 },
          "location": { "match": true, "weight": 10, "earned": 10 },
          "profession": { "match": true, "weight": 5, "earned": 5 },
          "personality": { "match": true, "weight": 5, "earned": 5 },
          "genderPref": { "match": true, "weight": 5, "earned": 5 }
        }
      },
      
      "interestStatus": null  // null, "SENT", "RECEIVED", "ACCEPTED"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

---

## Matching Algorithm Details

### Factor: Food (15%)

```javascript
function matchFood(profileA, profileB) {
  // BOTH is flexible - matches anything
  if (profileA.food === 'BOTH' || profileB.food === 'BOTH') {
    return true;
  }
  // Otherwise must match exactly
  return profileA.food === profileB.food;
}
```

| A | B | Match? |
|---|---|--------|
| VEG | VEG | ✅ |
| VEG | NON_VEG | ❌ |
| VEG | BOTH | ✅ |
| BOTH | NON_VEG | ✅ |

### Factor: Smoking (15%)

```javascript
function matchSmoking(profileA, profileB) {
  // Must match exactly - no flexibility
  return profileA.smoking === profileB.smoking;
}
```

### Factor: Budget (15%)

```javascript
function matchBudget(profileA, profileB) {
  // Check if budget ranges overlap
  const aMin = profileA.budgetMin;
  const aMax = profileA.budgetMax;
  const bMin = profileB.budgetMin;
  const bMax = profileB.budgetMax;
  
  // Ranges overlap if: aMin <= bMax AND bMin <= aMax
  return aMin <= bMax && bMin <= aMax;
}
```

| A Range | B Range | Match? |
|---------|---------|--------|
| 5k-10k | 8k-15k | ✅ (overlap: 8k-10k) |
| 5k-10k | 12k-20k | ❌ |
| 5k-15k | 10k-12k | ✅ (B within A) |

### Factor: Location (10%)

```javascript
function matchLocation(profileA, profileB) {
  if (profileA.city !== profileB.city) {
    return 0; // Different city = 0%
  }
  if (profileA.area === profileB.area) {
    return 100; // Same area = 100%
  }
  return 50; // Same city, different area = 50%
}
```

### Factor: Cleanliness (10%)

```javascript
function matchCleanliness(profileA, profileB) {
  // FLEXIBLE matches anything
  if (profileA.cleanliness === 'FLEXIBLE' || profileB.cleanliness === 'FLEXIBLE') {
    return true;
  }
  return profileA.cleanliness === profileB.cleanliness;
}
```

### Factor: Personality (5%)

```javascript
function matchPersonality(profileA, profileB) {
  // AMBIVERT is flexible
  if (profileA.personality === 'AMBIVERT' || profileB.personality === 'AMBIVERT') {
    return true;
  }
  return profileA.personality === profileB.personality;
}
```

### Factor: Gender Preference (5%)

```javascript
function matchGenderPref(profileA, profileB) {
  // If either prefers ANY, it's a match
  if (profileA.preferredGender === 'ANY' || profileB.preferredGender === 'ANY') {
    return true;
  }
  // If both prefer SAME, check if they're same gender
  return profileA.gender === profileB.gender;
}
```

---

## Profile Detail

### Request

```http
GET /api/v1/roommate/665a1b2c3d4e5f6789012345
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "photo": "https://res.cloudinary.com/...",
    "age": 25,
    "gender": "MALE",
    "profession": "WORKING",
    "companyName": "Infosys",
    
    "food": "VEG",
    "smoking": "NO",
    "drinking": "NO",
    "sleep": "EARLY_BIRD",
    "personality": "AMBIVERT",
    "petFriendly": false,
    "cleanliness": "VERY_CLEAN",
    "guests": "SOMETIMES",
    "noise": "PREFER_QUIET",
    
    "budgetMin": 6000,
    "budgetMax": 12000,
    "preferredAreas": ["MP Nagar", "Arera Colony", "Shahpura"],
    "moveInDate": "2026-05-01T00:00:00.000Z",
    "duration": "SIX_TO_TWELVE_MONTHS",
    "roomPreferences": ["Attached bathroom", "Balcony"],
    "preferredGender": "SAME",
    
    "bio": "Software engineer at Infosys, looking for a like-minded roommate. I'm an early riser, prefer a clean environment, and enjoy cooking on weekends. Looking for someone who values their personal space but is also friendly.",
    
    "hasRoom": true,
    "roomAddress": "Near DB Mall, MP Nagar",
    "roomArea": "MP Nagar",
    "rentPerPerson": 7000,
    "occupants": 1,
    "roomPhotos": [
      "https://res.cloudinary.com/projectx/image/upload/room1.jpg",
      "https://res.cloudinary.com/projectx/image/upload/room2.jpg"
    ],
    "roomAmenities": ["WIFI", "AC", "ATTACHED_BATHROOM", "BALCONY"],
    
    "city": "Bhopal",
    "area": "MP Nagar",
    
    "isActive": true,
    "isVerified": true,
    "viewCount": 157,  // Incremented
    
    "user": {
      "id": "user_123",
      "name": "Rahul Sharma",
      "profilePhoto": "https://...",
      "isPhoneVerified": true
    },
    
    "compatibility": {
      "score": 85,
      "label": "Great Match",
      "breakdown": {
        "food": { "match": true, "weight": 15, "earned": 15, "reason": "Both prefer vegetarian" },
        "smoking": { "match": true, "weight": 15, "earned": 15, "reason": "Both non-smokers" },
        "budget": { "match": true, "weight": 15, "earned": 15, "reason": "Budget ranges overlap" },
        "drinking": { "match": false, "weight": 10, "earned": 0, "reason": "Different drinking preferences" },
        "sleep": { "match": true, "weight": 10, "earned": 10, "reason": "Both early birds" },
        "cleanliness": { "match": true, "weight": 10, "earned": 10, "reason": "Similar cleanliness standards" },
        "location": { "match": true, "weight": 10, "earned": 10, "reason": "Same area" },
        "profession": { "match": true, "weight": 5, "earned": 5, "reason": "Both working professionals" },
        "personality": { "match": true, "weight": 5, "earned": 5, "reason": "Compatible personalities" },
        "genderPref": { "match": true, "weight": 5, "earned": 5, "reason": "Gender preference matched" }
      }
    },
    
    "interestStatus": null,
    
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-04-01T15:30:00.000Z"
  }
}
```

---

## Send Interest

### Request

```http
POST /api/v1/roommate/665a1b2c3d4e5f6789012345/interest
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Hey Rahul! I saw your profile and we seem like a great match. I'm also a software developer and looking for a place in MP Nagar. Would love to connect!"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Interest sent successfully",
  "data": {
    "id": "interest_001",
    "senderId": "my_profile_id",
    "receiverId": "665a1b2c3d4e5f6789012345",
    "message": "Hey Rahul! I saw your profile...",
    "status": "PENDING",
    "createdAt": "2026-04-04T09:00:00.000Z"
  }
}
```

**Side Effects:**
- Receiver gets notification
- Can only send one interest per profile

---

## Get Interests

### Request

```http
GET /api/v1/roommate/interests?type=received&status=PENDING
Authorization: Bearer <access_token>
```

### Query Parameters

| Param | Type | Values |
|-------|------|--------|
| `type` | enum | `sent`, `received`, `all` |
| `status` | enum | `PENDING`, `ACCEPTED`, `DECLINED` |

### Response

```json
{
  "success": true,
  "message": "Interests fetched",
  "data": {
    "sent": [
      {
        "id": "interest_001",
        "status": "PENDING",
        "message": "Hey! Would love to connect...",
        "createdAt": "2026-04-03T10:00:00.000Z",
        "receiver": {
          "id": "profile_456",
          "photo": "https://...",
          "name": "Rahul Sharma",
          "age": 25,
          "profession": "WORKING",
          "city": "Bhopal",
          "area": "MP Nagar",
          "compatibility": { "score": 85, "label": "Great Match" }
        }
      }
    ],
    "received": [
      {
        "id": "interest_002",
        "status": "PENDING",
        "message": "Hi! I noticed we have similar preferences...",
        "createdAt": "2026-04-04T08:00:00.000Z",
        "sender": {
          "id": "profile_789",
          "photo": "https://...",
          "name": "Vikram Singh",
          "age": 26,
          "profession": "STUDENT",
          "city": "Bhopal",
          "area": "Arera Colony",
          "compatibility": { "score": 72, "label": "Good Match" }
        }
      }
    ]
  }
}
```

---

## Respond to Interest

### Accept

```http
PUT /api/v1/roommate/interests/interest_002/respond
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "action": "ACCEPT"
}
```

### Response

```json
{
  "success": true,
  "message": "Interest accepted! You're now connected.",
  "data": {
    "id": "interest_002",
    "status": "ACCEPTED",
    "updatedAt": "2026-04-04T09:30:00.000Z"
  }
}
```

**Side Effects:**
- Sender gets notification
- Both become "connections"
- Can now chat via Chat module

### Decline

```http
PUT /api/v1/roommate/interests/interest_002/respond
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "action": "DECLINE"
}
```

---

## Get Connections

### Request

```http
GET /api/v1/roommate/connections
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Connections fetched",
  "data": [
    {
      "id": "connection_001",
      "profile": {
        "id": "profile_789",
        "photo": "https://...",
        "age": 26,
        "gender": "MALE",
        "profession": "STUDENT",
        "city": "Bhopal",
        "area": "Arera Colony",
        "hasRoom": false
      },
      "user": {
        "id": "user_789",
        "name": "Vikram Singh",
        "phone": "+919876543210",  // Revealed after connection
        "profilePhoto": "https://..."
      },
      "connectedAt": "2026-04-04T09:30:00.000Z",
      "conversationId": "conv_123"  // For direct chat link
    }
  ]
}
```

---

## Roommate Groups

### Browse Groups

```http
GET /api/v1/roommate/groups?city=Bhopal
Authorization: Bearer <access_token>
```

### Response

```json
{
  "success": true,
  "message": "Groups fetched",
  "data": [
    {
      "id": "group_001",
      "name": "MANIT Bhopal Roommates",
      "description": "For MANIT students looking for roommates near campus",
      "city": "Bhopal",
      "area": "MANIT Campus",
      "maxMembers": 50,
      "memberCount": 23,
      "isJoined": false,
      "createdAt": "2026-03-01T10:00:00.000Z"
    },
    {
      "id": "group_002",
      "name": "Working Professionals MP Nagar",
      "description": "For working professionals in MP Nagar area",
      "city": "Bhopal",
      "area": "MP Nagar",
      "maxMembers": 30,
      "memberCount": 18,
      "isJoined": true,
      "createdAt": "2026-02-15T10:00:00.000Z"
    }
  ]
}
```

### Create Group

```http
POST /api/v1/roommate/groups
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "TCS Bhopal Roommates",
  "description": "For TCS employees looking for roommates in Bhopal",
  "city": "Bhopal",
  "area": "MP Nagar",
  "maxMembers": 25
}
```

### Join Group

```http
POST /api/v1/roommate/groups/group_001/join
Authorization: Bearer <access_token>
```

### Leave Group

```http
DELETE /api/v1/roommate/groups/group_001/leave
Authorization: Bearer <access_token>
```

---

## Score Labels

| Score Range | Label | Emoji | Description |
|-------------|-------|-------|-------------|
| 80-100 | Great Match | ✅ | Highly compatible |
| 60-79 | Good Match | 👍 | Good compatibility |
| 40-59 | Fair Match | 🤝 | Some differences |
| 0-39 | Low Match | ⚠️ | Significant differences |

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `PROFILE_NOT_FOUND` | 404 | Roommate profile doesn't exist |
| `PROFILE_EXISTS` | 409 | User already has a profile |
| `INTEREST_EXISTS` | 409 | Already sent interest |
| `SELF_INTEREST` | 400 | Can't send interest to yourself |
| `INTEREST_NOT_FOUND` | 404 | Interest doesn't exist |
| `NOT_RECEIVER` | 403 | Only receiver can respond |
| `ALREADY_RESPONDED` | 400 | Interest already responded to |
| `GROUP_FULL` | 400 | Group has max members |
| `ALREADY_MEMBER` | 409 | Already a group member |

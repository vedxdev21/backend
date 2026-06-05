# 🛡️ Admin Module

## Overview

Full admin panel API for managing users, listings, reviews, reports. Includes dashboard analytics, broadcast notifications, and app settings.

## Authentication

Admin has a separate login endpoint:
```json
POST /admin/login
{ "email": "admin@projectx.in", "password": "admin123456" }
```
Returns a JWT token. All other admin routes require this token + `ADMIN` role.

## Endpoints

### Dashboard & Analytics

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/dashboard` | Platform stats (users, listings, reports) |
| GET | `/admin/analytics` | 30-day growth metrics + top cities |
| GET | `/admin/coming-soon/stats` | Signup counts by service |

### User Management

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/users` | List users (search, filter by role) |
| GET | `/admin/users/:id` | User detail with counts |
| PATCH | `/admin/users/:id/verify` | Mark phone as verified |
| PATCH | `/admin/users/:id/block` | Block/unblock user |
| DELETE | `/admin/users/:id` | Delete user |

### Property Management

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/properties` | All properties (filter by status/city) |
| PATCH | `/admin/properties/:id/approve` | Approve listing |
| PATCH | `/admin/properties/:id/reject` | Reject listing |
| PATCH | `/admin/properties/:id/feature` | Toggle featured |
| DELETE | `/admin/properties/:id` | Delete listing |

### Mess Management

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/mess` | All mess listings |
| PATCH | `/admin/mess/:id/verify` | Verify mess |
| DELETE | `/admin/mess/:id` | Delete mess |

### Cook Management

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/cooks` | All cook profiles |
| PATCH | `/admin/cooks/:id/verify` | Verify cook |
| DELETE | `/admin/cooks/:id` | Delete cook |

### Review Management

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/reviews` | All reviews |
| PATCH | `/admin/reviews/:id/hide` | Hide review |
| PATCH | `/admin/reviews/:id/feature` | Feature review |
| DELETE | `/admin/reviews/:id` | Delete review |

### Reports

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/reports` | All reports (filter by status) |
| PATCH | `/admin/reports/:id` | Update status + admin note |

### Notifications

| Method | Path | Description |
|--------|------|------------|
| POST | `/admin/notifications/send` | Send to specific user or broadcast to all |

**Broadcast to all users:**
```json
POST /admin/notifications/send
{
  "title": "Welcome to ProjectX!",
  "body": "Explore rooms, roommates, and mess near you."
}
```

**Send to specific user:**
```json
{
  "userId": "user-id",
  "title": "Your listing was approved",
  "body": "Your property is now live."
}
```

### Settings

| Method | Path | Description |
|--------|------|------------|
| GET | `/admin/settings` | Get all settings |
| PUT | `/admin/settings` | Update a setting |

**Default Settings:**
```
maintenance_mode (boolean)
registration_enabled (boolean)
max_property_photos (number)
max_mess_photos (number)
otp_expiry_minutes (number)
supported_cities (string[])
contact_email, contact_phone
terms_url, privacy_url
```

## Dashboard Response

```json
{
  "stats": {
    "users": 1250,
    "properties": 340,
    "mess": 85,
    "cooks": 42,
    "roommates": 178,
    "pendingReports": 5,
    "comingSoonSignups": 892
  }
}
```

## Analytics Response

```json
{
  "last30Days": {
    "newUsers": 120,
    "newProperties": 45,
    "newMess": 12,
    "newCooks": 8
  },
  "topCities": [
    { "city": "Bhopal", "_count": 89 },
    { "city": "Indore", "_count": 67 },
    { "city": "Delhi NCR", "_count": 54 }
  ]
}
```

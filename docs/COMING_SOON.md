# 🔜 Coming Soon Module

## Overview

Displays upcoming services (Phase 2) with a **"Notify Me"** signup system. Tracks interest per service and city for launch prioritization.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|------------|
| GET | `/coming-soon/services` | — | List all upcoming services |
| GET | `/coming-soon/services/:id` | — | Get service detail + signup count |
| POST | `/coming-soon/services/:id/notify` | Optional | Sign up for launch notification |

## Upcoming Services

| ID | Service | Icon | Description |
|----|---------|------|------------|
| `HOME_SERVICES` | Home Services | 🔧 | Electrician, plumber, AC repair, carpenter |
| `VEHICLE_SERVICES` | Vehicle Services | 🚗 | Car & bike repair, servicing, towing |
| `MEDICAL_SERVICES` | Medical Services | 🏥 | Doctor at home, nursing, lab tests |
| `UTILITY_BOOKING` | Utility Booking | 🛢️ | Gas cylinder, water tanker, packers & movers |
| `LABOUR_CHOWK` | Labour Chowk | 👷 | Daily wage workers, helpers, cleaners |

## Notify Me
```json
POST /coming-soon/services/HOME_SERVICES/notify
{
  "phone": "+919876543210",
  "email": "user@example.com",
  "city": "Bhopal"
}
```

- Prevents duplicate signups (unique by service + phone)
- If user is logged in, links to their account
- Signup count is shown on the service card

## Admin Analytics
```
GET /admin/coming-soon/stats
```
Returns signup counts grouped by service — helps decide which service to launch next.

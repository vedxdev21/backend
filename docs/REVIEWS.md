# ⭐ Reviews Module

## Overview

Polymorphic review system — works across **properties, mess, and cooks**. Includes rating distribution, average calculation, and featured reviews.

## Endpoints

| Method | Path | Description |
|--------|------|------------|
| GET | `/reviews/:targetType/:targetId` | Get reviews with stats |
| POST | `/reviews` | Create review |
| PUT | `/reviews/:id` | Update your review |
| DELETE | `/reviews/:id` | Delete your review |

## Target Types

| `targetType` | Example Target |
|--------------|---------------|
| `PROPERTY` | A property listing |
| `MESS` | A mess/tiffin service |
| `COOK` | A cook profile |

## Create Review
```json
POST /reviews
{
  "targetType": "MESS",
  "targetId": "mess-id-here",
  "rating": 4,
  "comment": "Great home-style food. Dal and roti are excellent!",
  "photos": ["https://cloudinary.com/review-photo.jpg"]
}
```

## Response with Stats
```json
{
  "reviews": [...],
  "stats": {
    "average": 4.2,
    "total": 47,
    "distribution": [
      { "rating": 5, "count": 20 },
      { "rating": 4, "count": 15 },
      { "rating": 3, "count": 8 },
      { "rating": 2, "count": 3 },
      { "rating": 1, "count": 1 }
    ]
  },
  "meta": { "page": 1, "limit": 10, "total": 47 }
}
```

## Features
- ⭐ 1-5 star rating
- 📝 Text comment (optional)
- 📸 Photo attachments (optional)
- 📊 Rating distribution (how many 1-star, 2-star, etc.)
- 🏆 Admin can feature/hide reviews
- 🔒 Only review author can edit/delete

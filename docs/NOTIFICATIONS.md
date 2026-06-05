# 🔔 Notifications Module

## Overview

Push notification system for in-app events. Supports type-based filtering, unread counts, and batch read operations.

## Endpoints

| Method | Path | Description |
|--------|------|------------|
| GET | `/notifications` | Get all (paginated) |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

## Notification Types

| Type | When Created |
|------|-------------|
| `INQUIRY` | Someone inquires about your property |
| `INTEREST` | Roommate interest received |
| `INTEREST_ACCEPTED` | Your interest was accepted |
| `MESSAGE` | New chat message (when offline) |
| `PROPERTY_ALERT` | New property matches your alert |
| `REVIEW` | Someone reviewed your listing |
| `SYSTEM` | System-wide announcements |
| `ADMIN_ANNOUNCEMENT` | Admin broadcast notifications |

## Filtering
```
GET /notifications?type=INQUIRY
GET /notifications?page=1&limit=20
```

## Real-time Push
When a notification is created, it's also pushed via Socket.io to the user's room:
```javascript
io.to(`user:${userId}`).emit('notification', notificationData);
```

## Schema
```
userId, type, title, body, data (JSON metadata)
isRead (boolean), createdAt
```

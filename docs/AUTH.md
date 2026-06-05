# 🔐 Auth Module

## Overview

Full authentication system with **Phone OTP**, **Email/Password**, and **Google OAuth**. Uses JWT access/refresh token pairs with automatic rotation for security.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION ARCHITECTURE                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌─────────────┐                                                       │
│    │   CLIENT    │                                                       │
│    └──────┬──────┘                                                       │
│           │                                                              │
│           ▼                                                              │
│    ┌─────────────────────────────────────────────────────────┐           │
│    │              AUTH METHODS (Choose One)                  │           │
│    ├─────────────┬─────────────────┬────────────────────────┤           │
│    │  📱 Phone   │  📧 Email       │  🔵 Google OAuth       │           │
│    │  + OTP      │  + Password     │                        │           │
│    └──────┬──────┴────────┬────────┴───────────┬────────────┘           │
│           │               │                    │                         │
│           └───────────────┼────────────────────┘                         │
│                           ▼                                              │
│    ┌─────────────────────────────────────────────────────────┐           │
│    │                   TOKEN GENERATION                      │           │
│    │  ┌──────────────────┐  ┌──────────────────────────────┐ │           │
│    │  │  Access Token    │  │     Refresh Token            │ │           │
│    │  │  (15 min TTL)    │  │     (7 day TTL)              │ │           │
│    │  │  - userId        │  │     - Stored in DB           │ │           │
│    │  │  - name          │  │     - One active per user    │ │           │
│    │  │  - phone         │  │     - Rotation on refresh    │ │           │
│    │  │  - role          │  │                              │ │           │
│    │  └──────────────────┘  └──────────────────────────────┘ │           │
│    └─────────────────────────────────────────────────────────┘           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flows

### 1. Phone Registration Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  1. POST /auth/register      │                 │
│  Form:      │  { name, phone, password? }  │  Create user    │
│  - name     │ ─────────────────────────────▶  (unverified)   │
│  - phone    │                              │                 │
│  - password │  2. 201 Created              │                 │
│             │ ◀─────────────────────────────                 │
│             │                              │                 │
│             │  3. POST /auth/send-otp      │                 │
│             │  { phone }                   │  Generate OTP   │
│             │ ─────────────────────────────▶  Store in Redis │
│             │                              │  Send SMS/Log   │
│             │  4. 200 OTP Sent             │                 │
│             │ ◀─────────────────────────────                 │
│             │                              │                 │
│             │  5. POST /auth/verify-otp    │                 │
│             │  { phone, otp }              │  Verify OTP     │
│             │ ─────────────────────────────▶  Mark verified  │
│             │                              │  Generate JWT   │
│             │  6. 200 + Tokens             │                 │
│  Save:      │ ◀─────────────────────────────                 │
│  - access   │  { accessToken,              │                 │
│  - refresh  │    refreshToken }            │                 │
└─────────────┘                              └─────────────────┘
```

### 2. Phone Login Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  1. POST /auth/send-otp      │                 │
│             │  { phone }                   │  Generate OTP   │
│             │ ─────────────────────────────▶  Store in Redis │
│             │                              │                 │
│             │  2. 200 OTP Sent             │                 │
│             │ ◀─────────────────────────────                 │
│             │                              │                 │
│             │  3. POST /auth/login/phone   │                 │
│             │  { phone, otp }              │  Verify OTP     │
│             │ ─────────────────────────────▶  Check user     │
│             │                              │  Generate JWT   │
│             │  4. 200 + Tokens + User      │                 │
│             │ ◀─────────────────────────────                 │
└─────────────┘                              └─────────────────┘
```

### 3. Email/Password Login Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  POST /auth/login/email      │                 │
│  Form:      │  { email, password }         │  Find user      │
│  - email    │ ─────────────────────────────▶  bcrypt.compare │
│  - password │                              │  Generate JWT   │
│             │  200 + Tokens + User         │                 │
│             │ ◀─────────────────────────────                 │
└─────────────┘                              └─────────────────┘
```

### 4. Google OAuth Flow

```
┌─────────────┐                 ┌──────────┐                 ┌─────────────┐
│   CLIENT    │                 │  GOOGLE  │                 │   SERVER    │
├─────────────┤                 ├──────────┤                 ├─────────────┤
│             │  1. Sign in     │          │                 │             │
│             │ ────────────────▶          │                 │             │
│             │                 │  Auth    │                 │             │
│             │  2. ID Token    │          │                 │             │
│             │ ◀────────────────          │                 │             │
│             │                 │          │                 │             │
│             │  3. POST /auth/google      │                 │             │
│             │  { idToken }               │                 │             │
│             │ ─────────────────────────────────────────────▶ Verify with │
│             │                 │          │                 │ Google API  │
│             │                 │          │                 │ Find/Create │
│             │                 │          │                 │ user        │
│             │  4. 200 + Tokens + User    │                 │             │
│             │ ◀─────────────────────────────────────────────             │
└─────────────┘                 └──────────┘                 └─────────────┘
```

### 5. Token Refresh Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  Access token expired!       │                 │
│             │  (401 Unauthorized)          │                 │
│             │                              │                 │
│             │  POST /auth/refresh-token    │                 │
│             │  { refreshToken }            │  Verify refresh │
│             │ ─────────────────────────────▶  Rotate tokens  │
│             │                              │  Invalidate old │
│             │  200 + New Tokens            │                 │
│             │  { accessToken,              │                 │
│             │    refreshToken }            │                 │
│             │ ◀─────────────────────────────                 │
│             │                              │                 │
│  Replace    │                              │                 │
│  stored     │                              │                 │
│  tokens     │                              │                 │
└─────────────┘                              └─────────────────┘
```

### 6. Password Reset Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  1. POST /auth/forgot-pass   │                 │
│             │  { phone }                   │  Generate OTP   │
│             │ ─────────────────────────────▶  Send to phone  │
│             │                              │                 │
│             │  2. 200 OTP Sent             │                 │
│             │ ◀─────────────────────────────                 │
│             │                              │                 │
│             │  3. POST /auth/reset-pass    │                 │
│             │  { phone, otp, newPassword } │  Verify OTP     │
│             │ ─────────────────────────────▶  Hash password  │
│             │                              │  Update user    │
│             │  4. 200 Password Reset       │                 │
│             │ ◀─────────────────────────────                 │
└─────────────┘                              └─────────────────┘
```

---

## REST API Endpoints

### Base URL: `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create new user account |
| `POST` | `/send-otp` | ❌ | Send OTP to phone |
| `POST` | `/verify-otp` | ❌ | Verify OTP and get tokens |
| `POST` | `/login/phone` | ❌ | Login with phone + OTP |
| `POST` | `/login/email` | ❌ | Login with email + password |
| `POST` | `/google` | ❌ | Login/register with Google |
| `POST` | `/refresh-token` | ❌ | Get new access token |
| `POST` | `/forgot-password` | ❌ | Request password reset OTP |
| `POST` | `/reset-password` | ❌ | Reset password with OTP |
| `POST` | `/logout` | ✅ Bearer | Invalidate refresh token |

---

## Endpoint Details

### 1. Register

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Keshav Kumar",
  "phone": "+919876543210",
  "email": "keshav@example.com",    // Optional
  "password": "securePassword123"   // Optional (required if email provided)
}
```

**Validation Rules:**

| Field | Rules |
|-------|-------|
| `name` | Required, 2-100 chars |
| `phone` | Required, valid Indian format (+91XXXXXXXXXX) |
| `email` | Optional, valid email format |
| `password` | Required if email, min 8 chars |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your phone.",
  "data": {
    "id": "665a1b2c3d4e5f6789012345",
    "name": "Keshav Kumar",
    "phone": "+919876543210",
    "email": "keshav@example.com",
    "isPhoneVerified": false,
    "createdAt": "2026-04-04T09:00:00.000Z"
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 409 | `PHONE_EXISTS` | Phone already registered |
| 409 | `EMAIL_EXISTS` | Email already registered |

---

### 2. Send OTP

**Request:**
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+919876543210",
    "expiresIn": 300  // seconds (5 minutes)
  }
}
```

**Development Mode:**
In `console` mode, OTP is logged to terminal:
```
🔑 OTP for +919876543210: 123456
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 404 | `USER_NOT_FOUND` | Phone not registered |
| 429 | `RATE_LIMITED` | Too many OTP requests |

---

### 3. Verify OTP

**Request:**
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Keshav Kumar",
      "phone": "+919876543210",
      "email": "keshav@example.com",
      "isPhoneVerified": true,
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900  // 15 minutes
  }
}
```

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 400 | `INVALID_OTP` | Wrong OTP |
| 400 | `OTP_EXPIRED` | OTP has expired |
| 404 | `USER_NOT_FOUND` | Phone not registered |

---

### 4. Login with Phone

**Request:**
```http
POST /api/v1/auth/login/phone
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Keshav Kumar",
      "phone": "+919876543210",
      "email": "keshav@example.com",
      "profilePhoto": "https://res.cloudinary.com/...",
      "role": "USER",
      "isPhoneVerified": true,
      "isProfileComplete": true,
      "city": "Bhopal",
      "area": "MP Nagar"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### 5. Login with Email

**Request:**
```http
POST /api/v1/auth/login/email
Content-Type: application/json

{
  "email": "keshav@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
Same structure as phone login.

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `PHONE_NOT_VERIFIED` | Phone not verified yet |
| 403 | `USER_BLOCKED` | Account has been blocked |

---

### 6. Google OAuth Login

**Request:**
```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "665a1b2c3d4e5f6789012345",
      "name": "Keshav Kumar",
      "phone": null,  // May need to add phone later
      "email": "keshav@gmail.com",
      "profilePhoto": "https://lh3.googleusercontent.com/...",
      "authProvider": "GOOGLE",
      "googleId": "118234567890123456789",
      "isPhoneVerified": false,
      "isProfileComplete": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "isNewUser": true  // Frontend can show onboarding
  }
}
```

---

### 7. Refresh Token

**Request:**
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",  // New refresh token!
    "expiresIn": 900
  }
}
```

**Important:** Old refresh token is invalidated. Store the new one.

**Errors:**

| Status | Code | Message |
|--------|------|---------|
| 401 | `INVALID_TOKEN` | Refresh token invalid or expired |
| 401 | `TOKEN_REUSED` | This token was already used (possible attack) |

---

### 8. Forgot Password

**Request:**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset OTP sent",
  "data": {
    "phone": "+919876543210",
    "expiresIn": 300
  }
}
```

---

### 9. Reset Password

**Request:**
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

---

### 10. Logout

**Request:**
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Effect:** Invalidates the refresh token. Access token remains valid until expiry (15 min).

---

## JWT Token Details

### Access Token Payload

```json
{
  "id": "665a1b2c3d4e5f6789012345",
  "name": "Keshav Kumar",
  "phone": "+919876543210",
  "role": "USER",
  "iat": 1712223600,    // Issued at (Unix timestamp)
  "exp": 1712224500     // Expires at (15 min later)
}
```

### Using Access Token

Include in `Authorization` header:

```http
GET /api/v1/properties/my-listings
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Expiry Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    TOKEN LIFECYCLE                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Login                                                       │
│    │                                                         │
│    ▼                                                         │
│  ┌─────────────────┐                                         │
│  │ Access Token    │ ◀── Valid for 15 minutes                │
│  │ Refresh Token   │ ◀── Valid for 7 days                    │
│  └────────┬────────┘                                         │
│           │                                                  │
│           │  API Request                                     │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │ Access Valid?   │───── Yes ────▶ ✅ Process Request       │
│  └────────┬────────┘                                         │
│           │ No (expired)                                     │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │ Return 401      │ ◀── Client catches this                 │
│  │ Unauthorized    │                                         │
│  └────────┬────────┘                                         │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │ Refresh Token   │───── Valid ────▶ Get new tokens         │
│  │ Still Valid?    │                  Retry request          │
│  └────────┬────────┘                                         │
│           │ No (expired)                                     │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │ Force Re-login  │ ◀── Redirect to login screen            │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## OTP System

### Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Length | 6 digits | Numeric only |
| TTL | 5 minutes | Stored in Redis |
| Rate Limit | 5 per 5 min | Per phone number |
| Retry Limit | 3 attempts | Then OTP invalidated |

### SMS Providers

```typescript
// .env
SMS_PROVIDER=console  // Options: console, msg91, twilio

// Console mode (development)
// OTP prints to terminal:
// 🔑 OTP for +919876543210: 123456

// MSG91 (production)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id

// Twilio (alternative)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### OTP Storage

**Redis (Primary):**
```
Key:    otp:+919876543210
Value:  123456
TTL:    300 seconds
```

**Database Fallback (if Redis unavailable):**
```prisma
model User {
  otpCode      String?
  otpExpiresAt DateTime?
}
```

---

## Rate Limits

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `/register` | 20 | 15 min | Prevent mass account creation |
| `/send-otp` | 5 | 5 min | Prevent OTP spam |
| `/login/*` | 20 | 15 min | Prevent brute force |
| `/refresh-token` | 30 | 15 min | Normal usage |
| `/forgot-password` | 5 | 15 min | Prevent abuse |

**Rate Limit Response (429):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again in 5 minutes.",
  "error": {
    "code": "RATE_LIMITED",
    "retryAfter": 300
  }
}
```

---

## Frontend Integration

### React/React Native Example

```typescript
// services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const TOKEN_KEY = 'auth_tokens';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;  // Unix timestamp
}

class AuthService {
  private tokens: AuthTokens | null = null;
  
  // Initialize on app start
  async init() {
    const stored = await AsyncStorage.getItem(TOKEN_KEY);
    if (stored) {
      this.tokens = JSON.parse(stored);
    }
  }
  
  // Save tokens after login
  async setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    this.tokens = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000),
    };
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(this.tokens));
  }
  
  // Get access token (auto-refresh if needed)
  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;
    
    // Check if access token is expired (or about to expire in 1 min)
    if (Date.now() > this.tokens.expiresAt - 60000) {
      await this.refreshTokens();
    }
    
    return this.tokens?.accessToken || null;
  }
  
  // Refresh tokens
  async refreshTokens() {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token');
    }
    
    try {
      const response = await api.post('/auth/refresh-token', {
        refreshToken: this.tokens.refreshToken,
      });
      
      await this.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.expiresIn
      );
    } catch (error) {
      // Refresh failed - force re-login
      await this.logout();
      throw error;
    }
  }
  
  // Logout
  async logout() {
    try {
      if (this.tokens?.accessToken) {
        await api.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${this.tokens.accessToken}` }
        });
      }
    } finally {
      this.tokens = null;
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }
}

export const authService = new AuthService();
```

### API Interceptor

```typescript
// services/api.ts
import axios from 'axios';
import { authService } from './auth.service';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// Add auth header to all requests
api.interceptors.request.use(async (config) => {
  // Skip auth for public endpoints
  if (config.url?.includes('/auth/')) {
    return config;
  }
  
  const token = await authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh
      try {
        await authService.refreshTokens();
        // Retry original request
        return api.request(error.config);
      } catch {
        // Refresh failed - redirect to login
        navigation.navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Security Best Practices

### Password Requirements

- Minimum 8 characters
- Hashed with bcrypt (12 rounds)
- Never logged or returned in responses

### Token Security

- Access tokens: Short-lived (15 min)
- Refresh tokens: Rotated on every use
- Single active refresh token per user
- HTTPS required in production

### Phone Number Validation

```typescript
// Valid formats accepted:
+919876543210   // International format (preferred)
919876543210    // Without plus
9876543210      // 10 digits (auto-prefixed with +91)

// Validation regex:
/^\+?91?[6-9]\d{9}$/
```

---

## Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INVALID_OTP` | 400 | OTP doesn't match |
| `OTP_EXPIRED` | 400 | OTP has expired (5 min) |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `INVALID_TOKEN` | 401 | JWT invalid or expired |
| `TOKEN_REUSED` | 401 | Refresh token already used |
| `PHONE_NOT_VERIFIED` | 403 | Phone verification required |
| `USER_BLOCKED` | 403 | Account suspended |
| `USER_NOT_FOUND` | 404 | Phone not registered |
| `PHONE_EXISTS` | 409 | Phone already registered |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `RATE_LIMITED` | 429 | Too many requests |

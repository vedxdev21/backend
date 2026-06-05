# 💬 Chat Module

## Overview

Real-time messaging system using **REST API + Socket.io** for instant communication. Conversations are context-aware (tied to a property, roommate profile, mess, or cook) with typing indicators, read receipts, and online status tracking.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CHAT SYSTEM ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│    ┌─────────────┐              ┌─────────────────────────────────┐  │
│    │   CLIENT    │              │          SERVER                 │  │
│    │  (Web/App)  │              │                                 │  │
│    ├─────────────┤              ├─────────────────────────────────┤  │
│    │             │   REST API   │                                 │  │
│    │  HTTP       │─────────────▶│  Express Routes                 │  │
│    │  Requests   │              │  ├─ GET /conversations          │  │
│    │             │              │  ├─ POST /conversations         │  │
│    │             │              │  ├─ GET /conversations/:id      │  │
│    │             │              │  └─ POST /conversations/:id/msg │  │
│    │             │              │                                 │  │
│    ├─────────────┤              ├─────────────────────────────────┤  │
│    │             │   WebSocket  │                                 │  │
│    │  Socket.io  │◀────────────▶│  Socket.io Server               │  │
│    │  Client     │   (Bi-dir)   │  ├─ join_conversation           │  │
│    │             │              │  ├─ send_message                │  │
│    │             │              │  ├─ typing                      │  │
│    │             │              │  └─ mark_read                   │  │
│    └─────────────┘              └─────────────────────────────────┘  │
│                                           │                          │
│                                           ▼                          │
│                               ┌───────────────────────┐              │
│                               │      MongoDB          │              │
│                               │  ├─ ChatConversation  │              │
│                               │  └─ ChatMessage       │              │
│                               └───────────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### ChatConversation

```prisma
model ChatConversation {
  id             String      @id @default(auto()) @map("_id") @db.ObjectId
  participantIds String[]    @db.ObjectId    // Array of 2 user IDs
  context        ChatContext                  // Why chat started
  contextId      String?     @db.ObjectId    // Related entity ID
  lastMessage    String?                      // Preview text
  lastMessageAt  DateTime?                    // For sorting
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  messages       ChatMessage[]
}
```

### ChatMessage

```prisma
model ChatMessage {
  id             String           @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String           @db.ObjectId
  conversation   ChatConversation @relation(fields: [conversationId], references: [id])
  senderId       String           @db.ObjectId
  sender         User             @relation("sender", fields: [senderId], references: [id])
  type           MessageType      @default(TEXT)
  content        String
  metadata       Json?            // Extra data (image URL, location coords, etc.)
  isRead         Boolean          @default(false)
  createdAt      DateTime         @default(now())
}
```

### Enums

```prisma
enum ChatContext {
  PROPERTY    // Chat about a property listing
  ROOMMATE    // Chat about roommate matching
  MESS        // Chat about mess/tiffin service
  COOK        // Chat about hiring a cook
}

enum MessageType {
  TEXT           // Plain text message
  IMAGE          // Image attachment
  LOCATION       // Shared GPS coordinates
  LISTING_SHARE  // Shared listing card
}
```

---

## REST API Endpoints

### Base URL: `/api/v1/chat`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/conversations` | ✅ Bearer | Get all user's conversations |
| `POST` | `/conversations` | ✅ Bearer | Start a new conversation |
| `GET` | `/conversations/:id` | ✅ Bearer | Get messages (paginated) |
| `POST` | `/conversations/:id/messages` | ✅ Bearer | Send a message via REST |

---

### 1. Get All Conversations

**Request:**
```http
GET /api/v1/chat/conversations
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversations fetched",
  "data": [
    {
      "id": "665a1b2c3d4e5f6789012345",
      "participantIds": ["user1_id", "user2_id"],
      "context": "PROPERTY",
      "contextId": "property_id_12345",
      "lastMessage": "Is the room still available?",
      "lastMessageAt": "2026-04-04T08:30:00.000Z",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-04T08:30:00.000Z",
      "otherUser": {
        "id": "user2_id",
        "name": "Rahul Sharma",
        "profilePhoto": "https://res.cloudinary.com/projectx/image/..."
      },
      "unreadCount": 3
    },
    {
      "id": "665a1b2c3d4e5f6789012346",
      "participantIds": ["user1_id", "user3_id"],
      "context": "ROOMMATE",
      "contextId": "roommate_profile_id",
      "lastMessage": "Sure, let's meet tomorrow!",
      "lastMessageAt": "2026-04-03T14:20:00.000Z",
      "otherUser": {
        "id": "user3_id",
        "name": "Priya Patel",
        "profilePhoto": null
      },
      "unreadCount": 0
    }
  ]
}
```

**Notes:**
- Sorted by `lastMessageAt` descending (most recent first)
- `otherUser` contains the other participant's basic info
- `unreadCount` shows messages not read by current user

---

### 2. Start New Conversation

**Request:**
```http
POST /api/v1/chat/conversations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "participantId": "665a1b2c3d4e5f6789abcdef",
  "context": "PROPERTY",
  "contextId": "665a1b2c3d4e5f6789property",
  "message": "Hi! Is this 2BHK in MP Nagar still available?"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `participantId` | string | ✅ | Other user's ID |
| `context` | enum | ✅ | `PROPERTY`, `ROOMMATE`, `MESS`, `COOK` |
| `contextId` | string | ❌ | ID of related entity (property, profile, etc.) |
| `message` | string | ❌ | Optional first message |

**Response (New Conversation):**
```json
{
  "success": true,
  "message": "Conversation created",
  "data": {
    "id": "665a1b2c3d4e5f6789new123",
    "participantIds": ["current_user_id", "665a1b2c3d4e5f6789abcdef"],
    "context": "PROPERTY",
    "contextId": "665a1b2c3d4e5f6789property",
    "lastMessage": "Hi! Is this 2BHK in MP Nagar still available?",
    "lastMessageAt": "2026-04-04T09:00:00.000Z",
    "createdAt": "2026-04-04T09:00:00.000Z"
  }
}
```

**Response (Existing Conversation):**
If a conversation already exists between these users with the same context, returns the existing one:
```json
{
  "success": true,
  "message": "Conversation fetched",
  "data": {
    "id": "665a1b2c3d4e5f6789existing",
    "participantIds": ["current_user_id", "665a1b2c3d4e5f6789abcdef"],
    "context": "PROPERTY",
    "contextId": "665a1b2c3d4e5f6789property",
    "lastMessage": "Previous last message",
    "lastMessageAt": "2026-04-03T15:00:00.000Z"
  }
}
```

**Real-time behavior:** Sending via REST also emits `new_message` to `conv:<conversationId>` so connected clients update instantly without polling.

---

### 3. Get Messages (Paginated)

**Request:**
```http
GET /api/v1/chat/conversations/665a1b2c3d4e5f6789012345?page=1&limit=20
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Messages per page |

**Response:**
```json
{
  "success": true,
  "message": "Messages fetched",
  "data": [
    {
      "id": "msg_001",
      "conversationId": "665a1b2c3d4e5f6789012345",
      "senderId": "user2_id",
      "type": "TEXT",
      "content": "Hi! Is the room still available?",
      "metadata": null,
      "isRead": true,
      "createdAt": "2026-04-04T08:00:00.000Z",
      "sender": {
        "id": "user2_id",
        "name": "Rahul Sharma",
        "profilePhoto": "https://res.cloudinary.com/..."
      }
    },
    {
      "id": "msg_002",
      "conversationId": "665a1b2c3d4e5f6789012345",
      "senderId": "user1_id",
      "type": "TEXT",
      "content": "Yes, it's available! Would you like to visit?",
      "metadata": null,
      "isRead": true,
      "createdAt": "2026-04-04T08:05:00.000Z",
      "sender": {
        "id": "user1_id",
        "name": "You",
        "profilePhoto": "https://res.cloudinary.com/..."
      }
    },
    {
      "id": "msg_003",
      "conversationId": "665a1b2c3d4e5f6789012345",
      "senderId": "user2_id",
      "type": "LOCATION",
      "content": "Here's my current location",
      "metadata": {
        "lat": 23.2332,
        "lng": 77.4345,
        "address": "MP Nagar, Bhopal"
      },
      "isRead": false,
      "createdAt": "2026-04-04T08:10:00.000Z",
      "sender": {
        "id": "user2_id",
        "name": "Rahul Sharma",
        "profilePhoto": "https://res.cloudinary.com/..."
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "totalPages": 3
  }
}
```

**Notes:**
- Messages returned in chronological order (oldest first)
- Unread messages from other user are auto-marked as read when fetched
- `metadata` contains type-specific data (location coords, image URLs, etc.)

---

### 4. Send Message via REST

**Request:**
```http
POST /api/v1/chat/conversations/665a1b2c3d4e5f6789012345/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Sure, I can come tomorrow at 5 PM",
  "type": "TEXT"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✅ | Message text or description |
| `type` | enum | ❌ | Default: `TEXT`. Options: `TEXT`, `IMAGE`, `LOCATION`, `LISTING_SHARE` |
| `metadata` | object | ❌ | Extra data for non-text messages |

**Examples for Different Types:**

```json
// TEXT Message
{
  "content": "Hello! Nice to meet you.",
  "type": "TEXT"
}

// IMAGE Message
{
  "content": "Here's a photo of the room",
  "type": "IMAGE",
  "metadata": {
    "url": "https://res.cloudinary.com/projectx/image/upload/v123/room_photo.jpg",
    "thumbnail": "https://res.cloudinary.com/projectx/image/upload/c_thumb,w_200/room_photo.jpg"
  }
}

// LOCATION Message
{
  "content": "Meeting point",
  "type": "LOCATION",
  "metadata": {
    "lat": 23.2332,
    "lng": 77.4345,
    "address": "MP Nagar Zone 1, Bhopal"
  }
}

// LISTING_SHARE Message
{
  "content": "Check out this property",
  "type": "LISTING_SHARE",
  "metadata": {
    "listingType": "PROPERTY",
    "listingId": "property_id_123",
    "title": "2BHK in MP Nagar",
    "rent": 12000,
    "photo": "https://res.cloudinary.com/..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "id": "msg_new_001",
    "conversationId": "665a1b2c3d4e5f6789012345",
    "senderId": "current_user_id",
    "type": "TEXT",
    "content": "Sure, I can come tomorrow at 5 PM",
    "metadata": null,
    "isRead": false,
    "createdAt": "2026-04-04T09:15:00.000Z",
    "sender": {
      "id": "current_user_id",
      "name": "Your Name",
      "profilePhoto": "https://..."
    }
  }
}
```

---

## Socket.io Real-time Events

### Connection Setup

```javascript
import { io } from 'socket.io-client';

// Connect with JWT authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-access-token-here'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to chat server');
  console.log('Socket ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  // Handle authentication errors
  if (error.message === 'Authentication required' || error.message === 'Invalid token') {
    // Redirect to login or refresh token
  }
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
  // Auto-reconnect is handled by Socket.io
});
```

### Authentication Flow

```
┌─────────────┐                              ┌─────────────────┐
│   CLIENT    │                              │     SERVER      │
├─────────────┤                              ├─────────────────┤
│             │  1. Connect with JWT token   │                 │
│             │ ────────────────────────────▶│                 │
│             │                              │  2. Verify JWT  │
│             │                              │     ↓           │
│             │  3a. Success → connected     │  ├─ Valid?      │
│             │ ◀────────────────────────────│  │  └─ Yes: OK  │
│             │                              │  │              │
│             │  3b. Error → connect_error   │  └─ No: Reject  │
│             │ ◀────────────────────────────│                 │
└─────────────┘                              └─────────────────┘
```

---

### Client → Server Events

#### 1. `join_conversation`

Join a conversation room to receive real-time messages.

```javascript
// Join when opening a chat
socket.emit('join_conversation', { 
  conversationId: '665a1b2c3d4e5f6789012345' 
});

// You can join multiple conversations
socket.emit('join_conversation', { conversationId: 'conv_2' });
socket.emit('join_conversation', { conversationId: 'conv_3' });
```

#### 2. `leave_conversation`

Leave a conversation room when navigating away.

```javascript
// Leave when closing chat or switching conversations
socket.emit('leave_conversation', { 
  conversationId: '665a1b2c3d4e5f6789012345' 
});
```

#### 3. `send_message`

Send a real-time message over WebSocket.

```javascript
// Send text message
socket.emit('send_message', {
  conversationId: '665a1b2c3d4e5f6789012345',
  content: 'Hey! Are you available to show the room?',
  type: 'TEXT'
});

// Send image
socket.emit('send_message', {
  conversationId: '665a1b2c3d4e5f6789012345',
  content: 'Room photo',
  type: 'IMAGE',
  metadata: {
    url: 'https://res.cloudinary.com/projectx/image/upload/v123/room.jpg'
  }
});

// Send location
socket.emit('send_message', {
  conversationId: '665a1b2c3d4e5f6789012345',
  content: 'I am here',
  type: 'LOCATION',
  metadata: {
    lat: 23.2332,
    lng: 77.4345
  }
});
```

#### 4. `mark_read`

Mark a specific message as read.

```javascript
socket.emit('mark_read', {
  conversationId: '665a1b2c3d4e5f6789012345',
  messageId: 'msg_001'
});
```

#### 5. `typing`

Send typing indicator.

```javascript
// User started typing
socket.emit('typing', {
  conversationId: '665a1b2c3d4e5f6789012345',
  isTyping: true
});

// User stopped typing (call after timeout or on blur)
socket.emit('typing', {
  conversationId: '665a1b2c3d4e5f6789012345',
  isTyping: false
});
```

**Best Practice for Typing Indicator:**
```javascript
let typingTimeout = null;

function handleInputChange(text) {
  // Emit typing start
  socket.emit('typing', { conversationId, isTyping: true });
  
  // Clear existing timeout
  clearTimeout(typingTimeout);
  
  // Set timeout to stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { conversationId, isTyping: false });
  }, 2000);
}
```

---

### Server → Client Events

### Single Broadcast Source

Both delivery paths now emit the same `new_message` event from the chat service:

1. `POST /api/v1/chat/conversations/:id/messages` (REST)
2. `send_message` (Socket.io)

This guarantees consistent real-time behavior across HTTP and WebSocket send flows and prevents drift between implementations.

#### 1. `new_message`

Received when a new message is sent in a joined conversation.

```javascript
socket.on('new_message', (message) => {
  console.log('📩 New message:', message);
  
  // message structure:
  // {
  //   id: 'msg_new_123',
  //   conversationId: '665a1b2c3d4e5f6789012345',
  //   senderId: 'user_456',
  //   senderName: 'Rahul Sharma',
  //   type: 'TEXT',
  //   content: 'Hey! Are you available?',
  //   metadata: null,
  //   createdAt: '2026-04-04T09:30:00.000Z'
  // }
  
  // Add to messages list
  addMessageToUI(message);
  
  // Scroll to bottom
  scrollToBottom();
  
  // Play notification sound if not from current user
  if (message.senderId !== currentUserId) {
    playNotificationSound();
  }
});
```

#### 2. `message_read`

Received when the other user reads your message.

```javascript
socket.on('message_read', ({ conversationId, messageId, readBy }) => {
  console.log('✅ Message read:', messageId, 'by', readBy);
  
  // Update UI to show read receipt (e.g., blue double-tick)
  markMessageAsRead(conversationId, messageId);
});
```

#### 3. `typing`

Received when another user is typing.

```javascript
socket.on('typing', ({ conversationId, userId, isTyping }) => {
  console.log(isTyping ? '⌨️ User is typing...' : '⌨️ User stopped typing');
  
  // Show/hide typing indicator in UI
  if (isTyping) {
    showTypingIndicator(conversationId, userId);
  } else {
    hideTypingIndicator(conversationId, userId);
  }
});
```

#### 4. `user_online`

Received when any user comes online or goes offline.

```javascript
socket.on('user_online', ({ userId, isOnline }) => {
  console.log(`🟢 User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
  
  // Update online status indicator
  updateUserOnlineStatus(userId, isOnline);
});
```

---

## Complete Frontend Integration Example

### React/React Native Implementation

```typescript
// hooks/useChat.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'LISTING_SHARE';
  content: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

interface TypingUser {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export function useChat(accessToken: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.API_URL!, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Chat connected');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 Chat disconnected');
      setIsConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Chat connection error:', error.message);
      setIsConnected(false);
    });
    
    // Message handlers
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    
    socket.on('message_read', ({ messageId }) => {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    });
    
    socket.on('typing', ({ conversationId, userId, isTyping }: TypingUser) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(`${conversationId}:${userId}`, true);
        } else {
          next.delete(`${conversationId}:${userId}`);
        }
        return next;
      });
    });
    
    socket.on('user_online', ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });
    
    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [accessToken]);
  
  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', { conversationId });
  }, []);
  
  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', { conversationId });
  }, []);
  
  // Send message
  const sendMessage = useCallback((
    conversationId: string,
    content: string,
    type: Message['type'] = 'TEXT',
    metadata?: any
  ) => {
    socketRef.current?.emit('send_message', {
      conversationId,
      content,
      type,
      metadata,
    });
  }, []);
  
  // Mark as read
  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    socketRef.current?.emit('mark_read', { conversationId, messageId });
  }, []);
  
  // Typing indicator
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { conversationId, isTyping });
  }, []);
  
  // Check if user is typing
  const isUserTyping = useCallback((conversationId: string, userId: string) => {
    return typingUsers.has(`${conversationId}:${userId}`);
  }, [typingUsers]);
  
  // Check if user is online
  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);
  
  return {
    isConnected,
    messages,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    setTyping,
    isUserTyping,
    isUserOnline,
  };
}
```

### Usage in Component

```tsx
// screens/ChatScreen.tsx
import { useChat } from '../hooks/useChat';

function ChatScreen({ conversationId, otherUser }) {
  const {
    isConnected,
    messages,
    joinConversation,
    leaveConversation,
    sendMessage,
    setTyping,
    isUserTyping,
    isUserOnline,
  } = useChat(accessToken);
  
  const [inputText, setInputText] = useState('');
  
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId]);
  
  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(conversationId, inputText);
    setInputText('');
    setTyping(conversationId, false);
  };
  
  const handleInputChange = (text: string) => {
    setInputText(text);
    setTyping(conversationId, text.length > 0);
  };
  
  return (
    <View>
      {/* Header with online status */}
      <Header>
        <Avatar user={otherUser} />
        <Text>{otherUser.name}</Text>
        <OnlineIndicator online={isUserOnline(otherUser.id)} />
      </Header>
      
      {/* Messages */}
      <MessageList messages={messages} />
      
      {/* Typing indicator */}
      {isUserTyping(conversationId, otherUser.id) && (
        <TypingIndicator user={otherUser} />
      )}
      
      {/* Input */}
      <Input
        value={inputText}
        onChange={handleInputChange}
        onSend={handleSend}
        disabled={!isConnected}
      />
    </View>
  );
}
```

---

## Conversation Context System

Every conversation is tied to a **context** — the reason why the chat started. This helps users understand the conversation purpose and enables context-specific features.

### Context Types

| Context | Description | Use Case |
|---------|-------------|----------|
| `PROPERTY` | Chat about a specific property | "Is this room still available?" |
| `ROOMMATE` | Chat about roommate matching | "I saw your profile, want to be roommates?" |
| `MESS` | Chat about mess/tiffin service | "Do you deliver to MP Nagar?" |
| `COOK` | Chat about hiring a cook | "What cuisines can you cook?" |

### How Context Works

```
┌──────────────────────────────────────────────────────────────┐
│                    CONTEXT-AWARE CHAT                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User sees property listing                                  │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │ "Chat with      │  Taps button                            │
│  │  Owner" button  │─────────┐                               │
│  └─────────────────┘         │                               │
│                              ▼                               │
│              POST /chat/conversations                        │
│              {                                               │
│                participantId: "owner_id",                    │
│                context: "PROPERTY",        ← Links to entity │
│                contextId: "property_123",                    │
│                message: "Is this available?"                 │
│              }                                               │
│                              │                               │
│                              ▼                               │
│              Conversation created/found                      │
│              Chat shows property context card                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Context Card in UI

When displaying a conversation, show a context card:

```
┌─────────────────────────────────────────────┐
│ 🏠 Context: Property                         │
│ ┌─────────────────────────────────────────┐ │
│ │ [Image]  2BHK in MP Nagar               │ │
│ │          ₹12,000/month                  │ │
│ │          [View Property →]              │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Messages...                                  │
└─────────────────────────────────────────────┘
```

---

## Message Types Deep Dive

### TEXT

Standard text message.

```json
{
  "type": "TEXT",
  "content": "Hello! Nice to meet you.",
  "metadata": null
}
```

### IMAGE

Photo attachment with preview.

```json
{
  "type": "IMAGE",
  "content": "Check out the room photos",
  "metadata": {
    "url": "https://res.cloudinary.com/projectx/image/upload/v123/room_photo.jpg",
    "thumbnail": "https://res.cloudinary.com/projectx/image/upload/c_thumb,w_200/room_photo.jpg",
    "width": 1920,
    "height": 1080,
    "size": 245000
  }
}
```

### LOCATION

GPS coordinates with optional address.

```json
{
  "type": "LOCATION",
  "content": "Meeting point",
  "metadata": {
    "lat": 23.2332,
    "lng": 77.4345,
    "address": "MP Nagar Zone 1, Bhopal, MP 462011",
    "placeName": "Zone-1 Metro Station"
  }
}
```

**UI Rendering:**
```
┌─────────────────────────────────┐
│ 📍 Meeting point                │
│ ┌─────────────────────────────┐ │
│ │      [Map Preview Image]     │ │
│ │                              │ │
│ │  MP Nagar Zone 1, Bhopal     │ │
│ │  [Open in Maps →]            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### LISTING_SHARE

Share a property/mess/cook listing.

```json
{
  "type": "LISTING_SHARE",
  "content": "Check out this property!",
  "metadata": {
    "listingType": "PROPERTY",
    "listingId": "property_123",
    "title": "2BHK Furnished Flat in Arera Colony",
    "subtitle": "₹15,000/month • 2 BHK • Furnished",
    "photo": "https://res.cloudinary.com/projectx/image/upload/property_123_main.jpg",
    "deepLink": "projectx://property/property_123"
  }
}
```

---

## Unread Count & Read Receipts

### How Unread Count Works

1. When a message is sent, `isRead` is `false`
2. When recipient fetches messages via REST, they're auto-marked as read
3. Socket `mark_read` event can manually mark individual messages

### Read Receipt Flow

```
┌─────────────┐                              ┌─────────────┐
│   USER A    │                              │   USER B    │
├─────────────┤                              ├─────────────┤
│             │  1. Sends message            │             │
│             │ ─────────────────────────────▶             │
│             │                              │             │
│  Shows:     │                              │  Shows:     │
│  ✓ (sent)   │                              │  New msg!   │
│             │                              │             │
│             │  2. B opens chat             │             │
│             │     (GET /conversations/:id) │             │
│             │                              │  Messages   │
│             │                              │  marked     │
│             │                              │  as read    │
│             │                              │             │
│             │  3. Server broadcasts        │             │
│  Shows:     │ ◀─────────────────────────────             │
│  ✓✓ (read)  │  message_read event          │             │
│             │                              │             │
└─────────────┘                              └─────────────┘
```

---

## Online Status Tracking

### How It Works

```javascript
// Server-side (sockets/index.ts)
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  
  // Mark online
  onlineUsers.set(userId, socket.id);
  io.emit('user_online', { userId, isOnline: true });
  
  // Mark offline on disconnect
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('user_online', { userId, isOnline: false });
  });
});
```

### UI Implementation

```jsx
function OnlineIndicator({ userId }) {
  const { isUserOnline } = useChat(token);
  const online = isUserOnline(userId);
  
  return (
    <View style={styles.indicator}>
      <View style={[
        styles.dot,
        { backgroundColor: online ? '#22C55E' : '#9CA3AF' }
      ]} />
      <Text style={styles.text}>
        {online ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}
```

---

## Error Handling

### REST API Errors

| Status | Error | Cause |
|--------|-------|-------|
| `401` | `Unauthorized` | Missing or invalid JWT token |
| `403` | `Forbidden` | Not a participant of this conversation |
| `404` | `Conversation not found` | Invalid conversation ID |
| `422` | `Validation error` | Invalid request body |

### Socket.io Errors

```javascript
socket.on('connect_error', (error) => {
  switch (error.message) {
    case 'Authentication required':
      // Token missing
      redirectToLogin();
      break;
    case 'Invalid token':
      // Token expired/invalid
      refreshTokenAndReconnect();
      break;
    default:
      // Network error
      showRetryOption();
  }
});
```

---

## Best Practices

### 1. Connection Management

```javascript
// ✅ Good: Single socket instance
const socket = useRef(io(...)).current;

// ❌ Bad: Creating new socket on every render
const socket = io(...);
```

### 2. Typing Indicator Debounce

```javascript
// ✅ Good: Debounced typing indicator
const debouncedTyping = useMemo(
  () => debounce((conversationId, isTyping) => {
    socket.emit('typing', { conversationId, isTyping });
  }, 300),
  [socket]
);
```

### 3. Message Pagination

```javascript
// ✅ Good: Load older messages on scroll
const loadMore = async () => {
  if (loading || !hasMore) return;
  const olderMessages = await api.get(`/conversations/${id}?page=${page + 1}`);
  setMessages([...olderMessages, ...messages]);
};
```

### 4. Optimistic Updates

```javascript
// ✅ Good: Show message immediately, then confirm
const sendMessage = (content) => {
  const tempId = `temp_${Date.now()}`;
  
  // Add to UI immediately
  setMessages([...messages, {
    id: tempId,
    content,
    status: 'sending',
    createdAt: new Date().toISOString(),
  }]);
  
  // Send via socket
  socket.emit('send_message', { conversationId, content });
  
  // Update status when confirmed
  socket.once('new_message', (msg) => {
    setMessages(prev => prev.map(m => 
      m.id === tempId ? { ...msg, status: 'sent' } : m
    ));
  });
};
```

---

## Rate Limits

| Action | Limit | Window |
|--------|-------|--------|
| Send message | 60 | 1 minute |
| Start conversation | 20 | 15 minutes |
| Socket connections | 5 | per user |

---

## Security Considerations

1. **JWT Validation**: Every socket connection and REST request validates JWT
2. **Participant Check**: Users can only access their own conversations
3. **Input Sanitization**: Message content is sanitized before storage
4. **Rate Limiting**: Prevents spam and abuse
5. **No PII in Logs**: Message content is not logged

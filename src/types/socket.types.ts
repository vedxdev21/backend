import { ChatContext, MessageType } from '@prisma/client';

// Socket.io typed events
export interface ServerToClientEvents {
  new_message: (data: ChatMessagePayload) => void;
  message_read: (data: { conversationId: string; messageId: string; readBy: string }) => void;
  typing: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  user_online: (data: { userId: string; isOnline: boolean }) => void;
  notification: (data: NotificationPayload) => void;
}

export interface ClientToServerEvents {
  join_conversation: (data: { conversationId: string }) => void;
  leave_conversation: (data: { conversationId: string }) => void;
  send_message: (data: SendMessagePayload) => void;
  mark_read: (data: { conversationId: string; messageId: string }) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  name: string;
}

export interface ChatMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

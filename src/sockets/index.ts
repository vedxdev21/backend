import { Server } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from '../utils/jwt.util';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types/socket.types';
import * as chatService from '../modules/chat/chat.service';
import { env } from '../config/env';

let ioInstance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export const initializeSocket = (httpServer: http.Server) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, '')),
      credentials: true,
    },
  });
  ioInstance = io;

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    const decoded = verifyAccessToken(token);
    if (!decoded) return next(new Error('Invalid token'));

    socket.data.userId = decoded.id;
    socket.data.name = decoded.name;
    next();
  });

  // Track online users
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User connected: ${socket.data.name} (${userId})`);

    // Mark online
    onlineUsers.set(userId, socket.id);
    io.emit('user_online', { userId, isOnline: true });

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // ---- Chat Events ----
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conv:${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        await chatService.sendMessage(data.conversationId, userId, {
          type: data.type,
          content: data.content,
          metadata: data.metadata as any,
        });
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('mark_read', async ({ conversationId, messageId }) => {
      try {
        await prismaMarkRead(conversationId, messageId, userId);
        io.to(`conv:${conversationId}`).emit('message_read', { conversationId, messageId, readBy: userId });
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { conversationId, userId, isTyping });
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.name}`);
      onlineUsers.delete(userId);
      io.emit('user_online', { userId, isOnline: false });
    });
  });

  return io;
};

export const getSocketServer = () => ioInstance;

// Helper
async function prismaMarkRead(conversationId: string, messageId: string, userId: string) {
  const { PrismaClient } = await import('@prisma/client');
  // Use the singleton from config
  const prisma = (await import('../config/database')).default;
  await prisma.chatMessage.updateMany({
    where: { conversationId, id: messageId, senderId: { not: userId } },
    data: { isRead: true },
  });
}

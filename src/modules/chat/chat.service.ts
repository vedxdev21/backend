import prisma from '../../config/database';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';
import { createNotification } from '../notification/notification.service';
import { getSocketServer } from '../../sockets';

export const getConversations = async (userId: string) => {
  const conversations = await prisma.chatConversation.findMany({
    where: { participantIds: { has: userId } },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Enrich with participant names and unread count
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== userId);
      const otherUser = otherUserId
        ? await prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true, profilePhoto: true } })
        : null;
      const latestMessage = await prisma.chatMessage.findFirst({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'desc' },
        select: { type: true },
      });
      const unreadCount = await prisma.chatMessage.count({
        where: { conversationId: conv.id, senderId: { not: userId }, isRead: false },
      });
      return { ...conv, otherUser, unreadCount, lastMessageType: latestMessage?.type || 'TEXT' };
    })
  );

  return enriched;
};

export const getMessages = async (conversationId: string, userId: string, query: any) => {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, participantIds: { has: userId } },
  });
  if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };

  const { page, limit, skip } = parsePagination(query);

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { sender: { select: { id: true, name: true, profilePhoto: true } } },
    }),
    prisma.chatMessage.count({ where: { conversationId } }),
  ]);

  // Mark messages as read
  await prisma.chatMessage.updateMany({
    where: { conversationId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return { messages: messages.reverse(), meta: buildPaginationMeta(page, limit, total) };
};

export const startConversation = async (userId: string, data: {
  recipientId?: string;
  participantId?: string;
  context?: string;
  contextId?: string;
  propertyId?: string;
  messId?: string;
  cookId?: string;
  roommateProfileId?: string;
  message?: string;
}) => {
  // Map frontend payload to internal format
  const participantId = data.participantId || data.recipientId;
  
  // Determine context from available fields
  let context = data.context;
  let contextId = data.contextId;
  
  if (data.propertyId) {
    context = 'PROPERTY';
    contextId = data.propertyId;
  } else if (data.messId) {
    context = 'MESS';
    contextId = data.messId;
  } else if (data.cookId) {
    context = 'COOK';
    contextId = data.cookId;
  } else if (data.roommateProfileId) {
    context = 'ROOMMATE';
    contextId = data.roommateProfileId;
  }

  // Validate required fields
  if (!participantId) {
    throw { statusCode: 400, message: 'Recipient ID is required' };
  }
  if (participantId === userId) {
    throw { statusCode: 400, message: 'You cannot start a conversation with yourself' };
  }
  if (!context) {
    throw { statusCode: 400, message: 'Context (context/propertyId/messId/cookId/roommateProfileId) is required' };
  }

  // Check existing conversation between these users with same context
  const existing = await prisma.chatConversation.findFirst({
    where: {
      participantIds: { hasEvery: [userId, participantId] },
      context: context as any,
      ...(contextId && { contextId: contextId }),
    },
  });

  if (existing) return existing;

  const conversation = await prisma.chatConversation.create({
    data: {
      participantIds: [userId, participantId],
      context: context as any,
      contextId: contextId || null,
      lastMessage: data.message || null,
      lastMessageAt: data.message ? new Date() : null,
    },
  });

  if (data.message) {
    await prisma.chatMessage.create({
      data: { conversationId: conversation.id, senderId: userId, content: data.message, type: 'TEXT' },
    });
  }

  return conversation;
};

export const sendMessage = async (conversationId: string, senderId: string, data: {
  type?: string;
  content: string;
  metadata?: any;
}) => {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id: conversationId, participantIds: { has: senderId } },
  });
  if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };

  const message = await prisma.chatMessage.create({
    data: {
      conversationId,
      senderId,
      type: (data.type as any) || 'TEXT',
      content: data.content,
      metadata: data.metadata,
    },
    include: { sender: { select: { id: true, name: true, profilePhoto: true } } },
  });

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { lastMessage: data.content, lastMessageAt: new Date() },
  });

  const io = getSocketServer();
  if (io) {
    io.to(`conv:${conversationId}`).emit('new_message', {
      id: message.id,
      conversationId,
      senderId: message.senderId,
      senderName: message.sender?.name || 'User',
      type: message.type,
      content: message.content,
      metadata: (message.metadata as Record<string, unknown> | undefined) || undefined,
      createdAt: message.createdAt,
    });
  }

  await Promise.allSettled(
    conversation.participantIds
      .filter((participantId) => participantId !== senderId)
      .map((userId) => createNotification({
        userId,
        type: 'NEW_CHAT_MESSAGE',
        title: 'New message',
        body: data.content,
        data: { conversationId, messageId: message.id },
      }))
  );

  return message;
};

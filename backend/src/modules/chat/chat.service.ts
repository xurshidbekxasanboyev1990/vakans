// ===========================================
// Chat Service
// Business logic for real-time messaging
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MessageType, UserRole } from '@prisma/client';
import { CreateChatRoomDto, SendMessageDto } from './dto';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // ===========================================
    // Get user's chat rooms
    // ===========================================
    async getUserChatRooms(userId: string) {
        const rooms = await this.prisma.chatRoom.findMany({
            where: {
                participants: {
                    some: { id: userId },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        companyName: true,
                        role: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        type: true,
                        createdAt: true,
                        isRead: true,
                        senderId: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Calculate unread count for each room
        const roomsWithUnread = await Promise.all(
            rooms.map(async (room) => {
                const unreadCount = await this.prisma.chatMessage.count({
                    where: {
                        chatRoomId: room.id,
                        senderId: { not: userId },
                        isRead: false,
                    },
                });

                return {
                    ...room,
                    unreadCount,
                    lastMessage: room.messages[0] || null,
                    otherParticipant: room.participants.find((p) => p.id !== userId),
                };
            }),
        );

        return roomsWithUnread;
    }

    // ===========================================
    // Get or create chat room
    // ===========================================
    async getOrCreateRoom(userId: string, createDto: CreateChatRoomDto) {
        const { participantId, jobId } = createDto;

        // Check if other participant exists
        const otherUser = await this.prisma.user.findUnique({
            where: { id: participantId },
        });

        if (!otherUser) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        // Check if room already exists between these users (optionally for specific job)
        const existingRoom = await this.prisma.chatRoom.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: participantId } } },
                    jobId ? { jobId } : {},
                ],
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        companyName: true,
                        role: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (existingRoom) {
            return existingRoom;
        }

        // Verify job if provided
        if (jobId) {
            const job = await this.prisma.job.findUnique({
                where: { id: jobId },
            });

            if (!job) {
                throw new NotFoundException('Ish topilmadi');
            }
        }

        // Create new room
        const newRoom = await this.prisma.chatRoom.create({
            data: {
                jobId,
                participants: {
                    connect: [{ id: userId }, { id: participantId }],
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        companyName: true,
                        role: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        return newRoom;
    }

    // ===========================================
    // Get chat room messages
    // ===========================================
    async getRoomMessages(
        roomId: string,
        userId: string,
        params: { page?: number; limit?: number },
    ) {
        // Maximum 200 messages per chat, default limit is 200
        const { page = 1, limit = 200 } = params;
        const actualLimit = Math.min(limit, 200); // Never exceed 200
        const skip = (page - 1) * actualLimit;

        // Verify user is participant
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: roomId,
                participants: {
                    some: { id: userId },
                },
            },
        });

        if (!room) {
            throw new ForbiddenException('Siz bu chatga kira olmaysiz');
        }

        const [messages, total] = await Promise.all([
            this.prisma.chatMessage.findMany({
                where: { chatRoomId: roomId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: actualLimit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            companyName: true,
                        },
                    },
                },
            }),
            this.prisma.chatMessage.count({ where: { chatRoomId: roomId } }),
        ]);

        // Mark messages as read
        await this.prisma.chatMessage.updateMany({
            where: {
                chatRoomId: roomId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return {
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                page,
                limit: actualLimit,
                total,
                totalPages: Math.ceil(total / actualLimit),
            },
        };
    }

    // ===========================================
    // Send message
    // ===========================================
    async sendMessage(
        senderId: string,
        roomId: string,
        messageDto: SendMessageDto,
    ) {
        const { content, type = MessageType.TEXT, fileUrl, fileName, fileSize } = messageDto;

        // Verify sender is participant
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: roomId,
                participants: {
                    some: { id: senderId },
                },
            },
            include: {
                participants: {
                    select: { id: true },
                },
            },
        });

        if (!room) {
            throw new ForbiddenException('Siz bu chatga xabar yuborolmaysiz');
        }

        // Validate content based on type
        if (type === MessageType.TEXT && (!content || content.trim() === '')) {
            throw new BadRequestException('Xabar matni kiritilishi shart');
        }

        if (
            (type === MessageType.IMAGE || type === MessageType.FILE) &&
            !fileUrl
        ) {
            throw new BadRequestException('Fayl URL kiritilishi shart');
        }

        // Create message
        const message = await this.prisma.chatMessage.create({
            data: {
                chatRoomId: roomId,
                senderId,
                content: content || '',
                type,
                fileUrl,
                fileName,
                fileSize,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        companyName: true,
                    },
                },
            },
        });

        // Update room's updatedAt
        await this.prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() },
        });

        // Clean up old messages - keep only last 200 messages per room
        const MAX_MESSAGES_PER_ROOM = 200;
        const messageCount = await this.prisma.chatMessage.count({
            where: { chatRoomId: roomId },
        });

        if (messageCount > MAX_MESSAGES_PER_ROOM) {
            // Get the oldest messages to delete (keep newest 200)
            const messagesToDelete = await this.prisma.chatMessage.findMany({
                where: { chatRoomId: roomId },
                orderBy: { createdAt: 'asc' },
                take: messageCount - MAX_MESSAGES_PER_ROOM,
                select: { id: true },
            });

            await this.prisma.chatMessage.deleteMany({
                where: {
                    id: { in: messagesToDelete.map((m) => m.id) },
                },
            });
        }

        // Get receiver ID for real-time notification
        const receiverId = room.participants.find((p) => p.id !== senderId)?.id;

        // Publish to Redis for real-time delivery
        if (receiverId) {
            await this.redis.publish('chat:message', {
                roomId,
                message,
                receiverId,
            });
        }

        return message;
    }

    // ===========================================
    // Mark messages as read
    // ===========================================
    async markAsRead(roomId: string, userId: string) {
        // Verify user is participant
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: roomId,
                participants: {
                    some: { id: userId },
                },
            },
        });

        if (!room) {
            throw new ForbiddenException('Siz bu chatga kira olmaysiz');
        }

        await this.prisma.chatMessage.updateMany({
            where: {
                chatRoomId: roomId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        // Publish read receipt
        await this.redis.publish('chat:read', {
            roomId,
            userId,
        });

        return { success: true };
    }

    // ===========================================
    // Delete message
    // ===========================================
    async deleteMessage(messageId: string, userId: string) {
        const message = await this.prisma.chatMessage.findUnique({
            where: { id: messageId },
            include: {
                chatRoom: {
                    include: {
                        participants: { select: { id: true } },
                    },
                },
            },
        });

        if (!message) {
            throw new NotFoundException('Xabar topilmadi');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('Siz bu xabarni o\'chira olmaysiz');
        }

        // Soft delete - just mark as deleted
        await this.prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                content: 'Xabar o\'chirildi',
                isDeleted: true,
                fileUrl: null,
                fileName: null,
            },
        });

        // Notify other participant
        const otherUserId = message.chatRoom.participants.find(
            (p) => p.id !== userId,
        )?.id;

        if (otherUserId) {
            await this.redis.publish('chat:delete', {
                roomId: message.chatRoomId,
                messageId,
                receiverId: otherUserId,
            });
        }

        return { success: true };
    }

    // ===========================================
    // Get total unread count for user
    // ===========================================
    async getUnreadCount(userId: string): Promise<number> {
        // Try cache first
        const cacheKey = `chat:unread:${userId}`;
        const cached = await this.redis.get<number>(cacheKey);

        if (cached !== null) {
            return cached;
        }

        const count = await this.prisma.chatMessage.count({
            where: {
                chatRoom: {
                    participants: {
                        some: { id: userId },
                    },
                },
                senderId: { not: userId },
                isRead: false,
            },
        });

        // Cache for 30 seconds
        await this.redis.set(cacheKey, count, 30);

        return count;
    }

    // ===========================================
    // Invalidate unread count cache
    // ===========================================
    async invalidateUnreadCache(userId: string) {
        await this.redis.del(`chat:unread:${userId}`);
    }

    // ===========================================
    // Check if users can chat
    // ===========================================
    async canChat(userId1: string, userId2: string): Promise<boolean> {
        // Users can chat if:
        // 1. One is employer and other is worker with application
        // 2. Admin can chat with anyone

        const [user1, user2] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId1 },
                select: { role: true },
            }),
            this.prisma.user.findUnique({
                where: { id: userId2 },
                select: { role: true },
            }),
        ]);

        if (!user1 || !user2) return false;

        // Admin can chat with anyone
        if (user1.role === UserRole.ADMIN || user2.role === UserRole.ADMIN) {
            return true;
        }

        // Check if there's an application between them
        const hasApplication = await this.prisma.application.findFirst({
            where: {
                OR: [
                    {
                        workerId: userId1,
                        job: { employerId: userId2 },
                    },
                    {
                        workerId: userId2,
                        job: { employerId: userId1 },
                    },
                ],
            },
        });

        return !!hasApplication;
    }

    // ===========================================
    // Admin: Get all chat rooms
    // ===========================================
    async getAllChatRooms(params: { page?: number; limit?: number; search?: string }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    {
                        participants: {
                            some: {
                                OR: [
                                    { firstName: { contains: search, mode: 'insensitive' as const } },
                                    { lastName: { contains: search, mode: 'insensitive' as const } },
                                    { email: { contains: search, mode: 'insensitive' as const } },
                                ],
                            },
                        },
                    },
                ],
            }
            : {};

        const [rooms, total] = await Promise.all([
            this.prisma.chatRoom.findMany({
                where,
                include: {
                    participants: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatar: true,
                            companyName: true,
                            role: true,
                        },
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            type: true,
                            createdAt: true,
                            isRead: true,
                            senderId: true,
                        },
                    },
                    job: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    _count: {
                        select: {
                            messages: true,
                        },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.chatRoom.count({ where }),
        ]);

        const roomsWithDetails = rooms.map((room) => ({
            ...room,
            lastMessage: room.messages[0] || null,
            messageCount: room._count.messages,
        }));

        return {
            data: roomsWithDetails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Admin: Get chat room messages (up to 1000)
    // ===========================================
    async getAdminRoomMessages(roomId: string, params: { page?: number; limit?: number }) {
        const { page = 1, limit = 100 } = params;
        const actualLimit = Math.min(limit, 1000); // Admin can view up to 1000 messages
        const skip = (page - 1) * actualLimit;

        const room = await this.prisma.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                        companyName: true,
                        role: true,
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!room) {
            throw new NotFoundException('Chat topilmadi');
        }

        const [messages, total] = await Promise.all([
            this.prisma.chatMessage.findMany({
                where: { chatRoomId: roomId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: actualLimit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            avatar: true,
                            companyName: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.chatMessage.count({ where: { chatRoomId: roomId } }),
        ]);

        return {
            room,
            messages: messages.reverse(),
            pagination: {
                page,
                limit: actualLimit,
                total,
                totalPages: Math.ceil(total / actualLimit),
            },
        };
    }

    // ===========================================
    // Admin: Delete chat room
    // ===========================================
    async deleteRoom(roomId: string) {
        const room = await this.prisma.chatRoom.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            throw new NotFoundException('Chat topilmadi');
        }

        // Delete all messages first, then the room
        await this.prisma.chatMessage.deleteMany({
            where: { chatRoomId: roomId },
        });

        await this.prisma.chatRoom.delete({
            where: { id: roomId },
        });

        return { success: true, message: 'Chat o\'chirildi' };
    }

    // ===========================================
    // Admin: Delete specific message
    // ===========================================
    async adminDeleteMessage(messageId: string) {
        const message = await this.prisma.chatMessage.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            throw new NotFoundException('Xabar topilmadi');
        }

        await this.prisma.chatMessage.delete({
            where: { id: messageId },
        });

        return { success: true, message: 'Xabar o\'chirildi' };
    }
}

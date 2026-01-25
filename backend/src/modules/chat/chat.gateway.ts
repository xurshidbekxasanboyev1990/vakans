// ===========================================
// Chat WebSocket Gateway
// Real-time messaging with Socket.io
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

// ===========================================
// Custom interface for authenticated socket
// ===========================================
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}

@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('ChatGateway');
    private connectedUsers = new Map<string, Set<string>>(); // userId -> socketIds

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
        private redis: RedisService,
        private chatService: ChatService,
    ) { }

    // ===========================================
    // Gateway initialization
    // ===========================================
    afterInit(server: Server) {
        this.logger.log('Chat WebSocket Gateway initialized');

        // Subscribe to Redis channels for cross-instance messaging
        this.subscribeToRedisChannels();
    }

    // ===========================================
    // Subscribe to Redis pub/sub channels
    // ===========================================
    private async subscribeToRedisChannels() {
        // New message channel
        await this.redis.subscribe('chat:message', (data) => {
            this.handleIncomingMessage(data);
        });

        // Read receipt channel
        await this.redis.subscribe('chat:read', (data) => {
            this.handleReadReceipt(data);
        });

        // Message deleted channel
        await this.redis.subscribe('chat:delete', (data) => {
            this.handleDeletedMessage(data);
        });

        // User typing channel
        await this.redis.subscribe('chat:typing', (data) => {
            this.handleTypingEvent(data);
        });
    }

    // ===========================================
    // Handle incoming message from Redis
    // ===========================================
    private handleIncomingMessage(data: any) {
        const { roomId, message, receiverId } = data;

        const receiverSockets = this.connectedUsers.get(receiverId);
        if (receiverSockets) {
            receiverSockets.forEach((socketId) => {
                this.server.to(socketId).emit('newMessage', {
                    roomId,
                    message,
                });
            });
        }
    }

    // ===========================================
    // Handle read receipt from Redis
    // ===========================================
    private handleReadReceipt(data: any) {
        const { roomId, userId } = data;

        // Emit to room
        this.server.to(`room:${roomId}`).emit('messagesRead', {
            roomId,
            readBy: userId,
        });
    }

    // ===========================================
    // Handle deleted message from Redis
    // ===========================================
    private handleDeletedMessage(data: any) {
        const { roomId, messageId, receiverId } = data;

        const receiverSockets = this.connectedUsers.get(receiverId);
        if (receiverSockets) {
            receiverSockets.forEach((socketId) => {
                this.server.to(socketId).emit('messageDeleted', {
                    roomId,
                    messageId,
                });
            });
        }
    }

    // ===========================================
    // Handle typing event from Redis
    // ===========================================
    private handleTypingEvent(data: any) {
        const { roomId, userId, isTyping } = data;

        this.server.to(`room:${roomId}`).emit('userTyping', {
            roomId,
            userId,
            isTyping,
        });
    }

    // ===========================================
    // Client connection handler
    // ===========================================
    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Extract token from handshake
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }

            // Verify token
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('jwt.secret'),
            });

            const userId = payload.sub;
            const userRole = payload.role;

            // Verify user exists
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, isBlocked: true },
            });

            if (!user || user.isBlocked) {
                client.disconnect();
                return;
            }

            // Store user info on socket
            client.userId = userId;
            client.userRole = userRole;

            // Add to connected users
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId)!.add(client.id);

            // Store user presence in Redis
            await this.redis.set(`presence:${userId}`, 'online', 3600);

            // Join user's personal room
            client.join(`user:${userId}`);

            // Join all user's chat rooms
            const chatRooms = await this.prisma.chatRoom.findMany({
                where: {
                    participants: { some: { id: userId } },
                },
                select: { id: true },
            });

            chatRooms.forEach((room) => {
                client.join(`room:${room.id}`);
            });

            this.logger.log(`User ${userId} connected with socket ${client.id}`);

            // Emit connection success
            client.emit('connected', {
                userId,
                socketId: client.id,
            });

        } catch (error: any) {
            this.logger.error(`Connection error: ${error?.message || error}`);
            client.disconnect();
        }
    }

    // ===========================================
    // Client disconnection handler
    // ===========================================
    async handleDisconnect(client: AuthenticatedSocket) {
        const userId = client.userId;

        if (userId) {
            // Remove socket from connected users
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);

                // If no more sockets, user is offline
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(userId);

                    // Update presence in Redis
                    await this.redis.set(`presence:${userId}`, 'offline', 3600);

                    // Store last seen
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { lastSeenAt: new Date() },
                    });
                }
            }

            this.logger.log(`User ${userId} disconnected socket ${client.id}`);
        }
    }

    // ===========================================
    // Send message
    // ===========================================
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string; content: string; type?: string; fileUrl?: string; fileName?: string; fileSize?: number },
    ) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        try {
            const message = await this.chatService.sendMessage(userId, data.roomId, {
                content: data.content,
                type: data.type as any,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
            });

            // Emit to room
            this.server.to(`room:${data.roomId}`).emit('newMessage', {
                roomId: data.roomId,
                message,
            });

            return { success: true, message };
        } catch (error: any) {
            return { error: error?.message || 'Xatolik yuz berdi' };
        }
    }

    // ===========================================
    // Join room
    // ===========================================
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string },
    ) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        // Verify user is participant
        const room = await this.prisma.chatRoom.findFirst({
            where: {
                id: data.roomId,
                participants: { some: { id: userId } },
            },
        });

        if (!room) {
            return { error: 'Chat topilmadi' };
        }

        client.join(`room:${data.roomId}`);

        // Mark messages as read
        await this.chatService.markAsRead(data.roomId, userId);

        return { success: true };
    }

    // ===========================================
    // Leave room
    // ===========================================
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string },
    ) {
        client.leave(`room:${data.roomId}`);
        return { success: true };
    }

    // ===========================================
    // Typing indicator
    // ===========================================
    @SubscribeMessage('typing')
    async handleTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string; isTyping: boolean },
    ) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        // Broadcast to room (except sender)
        client.to(`room:${data.roomId}`).emit('userTyping', {
            roomId: data.roomId,
            userId,
            isTyping: data.isTyping,
        });

        // Also publish to Redis for cross-instance support
        await this.redis.publish('chat:typing', {
            roomId: data.roomId,
            userId,
            isTyping: data.isTyping,
        });

        return { success: true };
    }

    // ===========================================
    // Mark messages as read
    // ===========================================
    @SubscribeMessage('markRead')
    async handleMarkRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { roomId: string },
    ) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        try {
            await this.chatService.markAsRead(data.roomId, userId);

            // Emit read receipt to room
            client.to(`room:${data.roomId}`).emit('messagesRead', {
                roomId: data.roomId,
                readBy: userId,
            });

            return { success: true };
        } catch (error: any) {
            return { error: error?.message || 'Xatolik yuz berdi' };
        }
    }

    // ===========================================
    // Get online status
    // ===========================================
    @SubscribeMessage('getOnlineStatus')
    async handleGetOnlineStatus(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { userIds: string[] },
    ) {
        const onlineStatus: Record<string, boolean> = {};

        for (const userId of data.userIds) {
            const presence = await this.redis.get<string>(`presence:${userId}`);
            onlineStatus[userId] = presence === 'online';
        }

        return { onlineStatus };
    }

    // ===========================================
    // Helper: Send to specific user
    // ===========================================
    async sendToUser(userId: string, event: string, data: any) {
        const userSockets = this.connectedUsers.get(userId);

        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }

    // ===========================================
    // Helper: Check if user is online
    // ===========================================
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId) &&
            this.connectedUsers.get(userId)!.size > 0;
    }
}

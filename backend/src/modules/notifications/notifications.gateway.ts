// ===========================================
// Notifications WebSocket Gateway
// Real-time notifications with Socket.io
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

// ===========================================
// Custom interface for authenticated socket
// ===========================================
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
}

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('NotificationsGateway');
    private connectedUsers = new Map<string, Set<string>>(); // userId -> socketIds

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
        private redis: RedisService,
        private notificationsService: NotificationsService,
    ) { }

    // ===========================================
    // Gateway initialization
    // ===========================================
    afterInit(server: Server) {
        this.logger.log('Notifications WebSocket Gateway initialized');

        // Subscribe to Redis notifications channel
        this.subscribeToRedisNotifications();
    }

    // ===========================================
    // Subscribe to Redis notifications channel
    // ===========================================
    private async subscribeToRedisNotifications() {
        await this.redis.subscribe('notifications', (data) => {
            this.handleNotification(data);
        });

        // Subscribe to broadcast channel
        await this.redis.subscribe('notifications:broadcast', (data) => {
            this.handleBroadcast(data);
        });
    }

    // ===========================================
    // Handle incoming notification from Redis
    // ===========================================
    private handleNotification(data: any) {
        const { userId, notification } = data;

        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }

    // ===========================================
    // Handle broadcast notification
    // ===========================================
    private handleBroadcast(data: any) {
        const { notification } = data;
        this.server.emit('notification', notification);
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

            // Join user's personal notification room
            client.join(`user:${userId}`);

            // Join role-based room for role-specific notifications
            client.join(`role:${userRole}`);

            this.logger.log(`User ${userId} connected to notifications with socket ${client.id}`);

            // Send current unread count
            const unreadCount = await this.notificationsService.getUnreadCount(userId);
            client.emit('unreadCount', { count: unreadCount });

        } catch (error: any) {
            this.logger.error(`Connection error: ${error?.message || error}`);
            client.disconnect();
        }
    }

    // ===========================================
    // Client disconnection handler
    // ===========================================
    handleDisconnect(client: AuthenticatedSocket) {
        const userId = client.userId;

        if (userId) {
            // Remove socket from connected users
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);

                // If no more sockets, remove user entry
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(userId);
                }
            }

            this.logger.log(`User ${userId} disconnected from notifications socket ${client.id}`);
        }
    }

    // ===========================================
    // Get unread count
    // ===========================================
    @SubscribeMessage('getUnreadCount')
    async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        const count = await this.notificationsService.getUnreadCount(userId);
        return { count };
    }

    // ===========================================
    // Mark notification as read
    // ===========================================
    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        data: { notificationId: string },
    ) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        try {
            await this.notificationsService.markAsRead(data.notificationId, userId);

            // Send updated count
            const count = await this.notificationsService.getUnreadCount(userId);
            client.emit('unreadCount', { count });

            return { success: true };
        } catch (error: any) {
            return { error: error?.message || 'Xatolik yuz berdi' };
        }
    }

    // ===========================================
    // Mark all as read
    // ===========================================
    @SubscribeMessage('markAllAsRead')
    async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
        const userId = client.userId;

        if (!userId) {
            return { error: 'Avtorizatsiya talab qilinadi' };
        }

        try {
            await this.notificationsService.markAllAsRead(userId);

            // Send updated count (0)
            client.emit('unreadCount', { count: 0 });

            return { success: true };
        } catch (error: any) {
            return { error: error?.message || 'Xatolik yuz berdi' };
        }
    }

    // ===========================================
    // Helper: Send notification to specific user
    // ===========================================
    async sendToUser(userId: string, notification: any) {
        const userSockets = this.connectedUsers.get(userId);

        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }

    // ===========================================
    // Helper: Send to all users with specific role
    // ===========================================
    sendToRole(role: string, notification: any) {
        this.server.to(`role:${role}`).emit('notification', notification);
    }

    // ===========================================
    // Helper: Broadcast to all connected users
    // ===========================================
    broadcastNotification(notification: any) {
        this.server.emit('notification', notification);
    }

    // ===========================================
    // Helper: Check if user is connected
    // ===========================================
    isUserConnected(userId: string): boolean {
        return this.connectedUsers.has(userId) &&
            this.connectedUsers.get(userId)!.size > 0;
    }

    // ===========================================
    // Helper: Get online users count
    // ===========================================
    getOnlineUsersCount(): number {
        return this.connectedUsers.size;
    }
}

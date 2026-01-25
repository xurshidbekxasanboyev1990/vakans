// ===========================================
// Notifications Service
// Business logic for notifications
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationFilterDto } from './dto';

// ===========================================
// Notification types for internal use
// ===========================================
export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    link?: string;
}

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // ===========================================
    // Get user notifications
    // ===========================================
    async getUserNotifications(
        userId: string,
        params: NotificationFilterDto,
    ) {
        const { page = 1, limit = 20, unreadOnly = false, type } = params;
        const skip = (page - 1) * limit;

        const where: any = { userId };

        if (unreadOnly) {
            where.isRead = false;
        }

        if (type) {
            where.type = type;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
            this.prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);

        return {
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Get unread count
    // ===========================================
    async getUnreadCount(userId: string): Promise<number> {
        // Try cache first
        const cacheKey = `notifications:unread:${userId}`;
        const cached = await this.redis.get<number>(cacheKey);

        if (cached !== null) {
            return cached;
        }

        const count = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        // Cache for 1 minute
        await this.redis.set(cacheKey, count, 60);

        return count;
    }

    // ===========================================
    // Create notification
    // ===========================================
    async create(payload: NotificationPayload) {
        const { userId, type, title, message, data, link } = payload;

        const notification = await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
                link,
            },
        });

        // Invalidate cache
        await this.invalidateUnreadCache(userId);

        // Publish to Redis for real-time delivery
        await this.redis.publish('notifications', {
            userId,
            notification,
        });

        return notification;
    }

    // ===========================================
    // Create multiple notifications
    // ===========================================
    async createMany(payloads: NotificationPayload[]) {
        const notifications = await this.prisma.$transaction(
            payloads.map((payload) =>
                this.prisma.notification.create({
                    data: {
                        userId: payload.userId,
                        type: payload.type,
                        title: payload.title,
                        message: payload.message,
                        data: payload.data,
                        link: payload.link,
                    },
                }),
            ),
        );

        // Invalidate caches and publish notifications
        const userIds = [...new Set(payloads.map((p) => p.userId))];

        await Promise.all([
            ...userIds.map((userId) => this.invalidateUnreadCache(userId)),
            ...notifications.map((notification, index) =>
                this.redis.publish('notifications', {
                    userId: payloads[index].userId,
                    notification,
                }),
            ),
        ]);

        return notifications;
    }

    // ===========================================
    // Mark notification as read
    // ===========================================
    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            throw new NotFoundException('Bildirishnoma topilmadi');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('Bu bildirishnomaga kirish huquqi yo\'q');
        }

        if (notification.isRead) {
            return notification;
        }

        const updated = await this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        // Invalidate cache
        await this.invalidateUnreadCache(userId);

        return updated;
    }

    // ===========================================
    // Mark all notifications as read
    // ===========================================
    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        // Invalidate cache
        await this.invalidateUnreadCache(userId);

        return { success: true };
    }

    // ===========================================
    // Delete notification
    // ===========================================
    async delete(notificationId: string, userId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            throw new NotFoundException('Bildirishnoma topilmadi');
        }

        if (notification.userId !== userId) {
            throw new ForbiddenException('Bu bildirishnomani o\'chirish huquqi yo\'q');
        }

        await this.prisma.notification.delete({
            where: { id: notificationId },
        });

        // Invalidate cache if it was unread
        if (!notification.isRead) {
            await this.invalidateUnreadCache(userId);
        }

        return { success: true };
    }

    // ===========================================
    // Delete all notifications
    // ===========================================
    async deleteAll(userId: string) {
        await this.prisma.notification.deleteMany({
            where: { userId },
        });

        // Invalidate cache
        await this.invalidateUnreadCache(userId);

        return { success: true };
    }

    // ===========================================
    // Helper notifications
    // ===========================================

    // Application submitted notification
    async notifyApplicationSubmitted(
        employerId: string,
        workerName: string,
        jobTitle: string,
        applicationId: string,
        jobId: string,
    ) {
        return this.create({
            userId: employerId,
            type: NotificationType.APPLICATION,
            title: 'Yangi ariza',
            message: `${workerName} "${jobTitle}" ishiga ariza topshirdi`,
            data: { applicationId, jobId },
            link: `/employer/applications/${applicationId}`,
        });
    }

    // Application status changed notification
    async notifyApplicationStatusChanged(
        workerId: string,
        jobTitle: string,
        status: string,
        applicationId: string,
        jobId: string,
    ) {
        let message = '';
        let title = '';

        switch (status) {
            case 'VIEWED':
                title = 'Ariza ko\'rib chiqildi';
                message = `"${jobTitle}" ishiga topshirgan arizangiz ko\'rib chiqildi`;
                break;
            case 'ACCEPTED':
                title = 'Tabriklaymiz! 🎉';
                message = `"${jobTitle}" ishiga arizangiz qabul qilindi`;
                break;
            case 'REJECTED':
                title = 'Ariza rad etildi';
                message = `"${jobTitle}" ishiga arizangiz rad etildi`;
                break;
        }

        return this.create({
            userId: workerId,
            type: NotificationType.APPLICATION,
            title,
            message,
            data: { applicationId, jobId, status },
            link: `/worker/applications/${applicationId}`,
        });
    }

    // New message notification
    async notifyNewMessage(
        userId: string,
        senderName: string,
        roomId: string,
        preview: string,
    ) {
        return this.create({
            userId,
            type: NotificationType.MESSAGE,
            title: 'Yangi xabar',
            message: `${senderName}: ${preview.substring(0, 50)}${preview.length > 50 ? '...' : ''}`,
            data: { roomId },
            link: `/chat/${roomId}`,
        });
    }

    // Job status changed notification
    async notifyJobStatusChanged(
        employerId: string,
        jobTitle: string,
        status: string,
        jobId: string,
        reason?: string,
    ) {
        let message = '';
        let title = '';

        switch (status) {
            case 'APPROVED':
                title = 'Ish tasdiqlandi ✅';
                message = `"${jobTitle}" ish e'loni tasdiqlandi va faol holatga o'tdi`;
                break;
            case 'REJECTED':
                title = 'Ish rad etildi ❌';
                message = `"${jobTitle}" ish e'loni rad etildi${reason ? `: ${reason}` : ''}`;
                break;
            case 'EXPIRED':
                title = 'Ish muddati tugadi';
                message = `"${jobTitle}" ish e'lonining muddati tugadi`;
                break;
        }

        return this.create({
            userId: employerId,
            type: NotificationType.JOB_APPROVED,
            title,
            message,
            data: { jobId, status, reason },
            link: `/employer/jobs/${jobId}`,
        });
    }

    // System notification
    async notifySystem(
        userId: string,
        title: string,
        message: string,
        link?: string,
        data?: Record<string, any>,
    ) {
        return this.create({
            userId,
            type: NotificationType.SYSTEM,
            title,
            message,
            data,
            link,
        });
    }

    // Broadcast notification to all users
    async broadcast(
        title: string,
        message: string,
        type: NotificationType = NotificationType.SYSTEM,
        link?: string,
    ) {
        const users = await this.prisma.user.findMany({
            where: { isBlocked: false },
            select: { id: true },
        });

        const payloads: NotificationPayload[] = users.map((user) => ({
            userId: user.id,
            type,
            title,
            message,
            link,
        }));

        // Create in batches of 100
        const batchSize = 100;
        const results: Awaited<ReturnType<typeof this.createMany>> = [];

        for (let i = 0; i < payloads.length; i += batchSize) {
            const batch = payloads.slice(i, i + batchSize);
            const batchResults = await this.createMany(batch);
            results.push(...batchResults);
        }

        return {
            success: true,
            count: results.length,
        };
    }

    // ===========================================
    // Helper: Invalidate unread cache
    // ===========================================
    async invalidateUnreadCache(userId: string) {
        await this.redis.del(`notifications:unread:${userId}`);
    }
}

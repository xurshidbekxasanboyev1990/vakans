// ===========================================
// Admin Service
// Administrative business logic
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    ApplicationStatus,
    JobStatus,
    NotificationType,
    UserRole,
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private notificationsService: NotificationsService,
    ) { }

    // ===========================================
    // Dashboard Statistics
    // ===========================================
    async getDashboardStats() {
        const cacheKey = 'admin:dashboard:stats';
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            return cached;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeek = new Date();
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date();
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        const [
            // User stats
            totalUsers,
            totalWorkers,
            totalEmployers,
            newUsersToday,
            newUsersThisWeek,
            blockedUsers,

            // Job stats
            totalJobs,
            activeJobs,
            pendingJobs,
            newJobsToday,
            newJobsThisWeek,

            // Application stats
            totalApplications,
            pendingApplications,
            acceptedApplications,
            newApplicationsToday,

            // Category stats
            totalCategories,
            activeCategories,

            // Recent activity
            recentUsers,
            recentJobs,
            recentApplications,
        ] = await Promise.all([
            // User stats
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: UserRole.WORKER } }),
            this.prisma.user.count({ where: { role: UserRole.EMPLOYER } }),
            this.prisma.user.count({ where: { createdAt: { gte: today } } }),
            this.prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
            this.prisma.user.count({ where: { isBlocked: true } }),

            // Job stats
            this.prisma.job.count(),
            this.prisma.job.count({ where: { status: JobStatus.ACTIVE } }),
            this.prisma.job.count({ where: { status: JobStatus.PENDING } }),
            this.prisma.job.count({ where: { createdAt: { gte: today } } }),
            this.prisma.job.count({ where: { createdAt: { gte: thisWeek } } }),

            // Application stats
            this.prisma.application.count(),
            this.prisma.application.count({ where: { status: ApplicationStatus.PENDING } }),
            this.prisma.application.count({ where: { status: ApplicationStatus.ACCEPTED } }),
            this.prisma.application.count({ where: { createdAt: { gte: today } } }),

            // Category stats
            this.prisma.category.count(),
            this.prisma.category.count({ where: { isActive: true } }),

            // Recent activity
            this.prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                },
            }),
            this.prisma.job.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    employer: {
                        select: {
                            companyName: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            this.prisma.application.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    worker: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    job: {
                        select: {
                            title: true,
                        },
                    },
                },
            }),
        ]);

        const stats = {
            users: {
                total: totalUsers,
                workers: totalWorkers,
                employers: totalEmployers,
                newToday: newUsersToday,
                newThisWeek: newUsersThisWeek,
                blocked: blockedUsers,
            },
            jobs: {
                total: totalJobs,
                active: activeJobs,
                pending: pendingJobs,
                newToday: newJobsToday,
                newThisWeek: newJobsThisWeek,
            },
            applications: {
                total: totalApplications,
                pending: pendingApplications,
                accepted: acceptedApplications,
                newToday: newApplicationsToday,
            },
            categories: {
                total: totalCategories,
                active: activeCategories,
            },
            recentActivity: {
                users: recentUsers,
                jobs: recentJobs,
                applications: recentApplications,
            },
        };

        // Cache for 5 minutes
        await this.redis.set(cacheKey, stats, 300);

        return stats;
    }

    // ===========================================
    // Analytics - Charts data
    // ===========================================
    async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
        const cacheKey = `admin:analytics:${period}`;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            return cached;
        }

        let startDate: Date;
        const endDate = new Date();

        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Get daily counts
        const [usersByDay, jobsByDay, applicationsByDay] = await Promise.all([
            this.prisma.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                },
                _count: true,
            }),
            this.prisma.job.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                },
                _count: true,
            }),
            this.prisma.application.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                },
                _count: true,
            }),
        ]);

        // Jobs by category
        const jobsByCategory = await this.prisma.job.groupBy({
            by: ['categoryId'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                categoryId: { not: null },
            },
            _count: true,
        });

        const categories = await this.prisma.category.findMany({
            where: {
                id: { in: jobsByCategory.map((j) => j.categoryId).filter((id): id is string => id !== null) },
            },
            select: { id: true, name: true },
        });

        const jobsByCategoryWithNames = jobsByCategory.map((item) => ({
            category: categories.find((c) => c.id === item.categoryId)?.name || 'Unknown',
            count: item._count,
        }));

        // Jobs by region
        const jobsByRegion = await this.prisma.job.groupBy({
            by: ['region'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
                region: { not: null },
            },
            _count: true,
        });

        // Application status distribution
        const applicationsByStatus = await this.prisma.application.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate, lte: endDate },
            },
            _count: true,
        });

        const analytics = {
            period,
            timeRange: { start: startDate, end: endDate },
            trends: {
                users: usersByDay,
                jobs: jobsByDay,
                applications: applicationsByDay,
            },
            distributions: {
                jobsByCategory: jobsByCategoryWithNames,
                jobsByRegion,
                applicationsByStatus,
            },
        };

        // Cache for 10 minutes
        await this.redis.set(cacheKey, analytics, 600);

        return analytics;
    }

    // ===========================================
    // Get all users (with filters)
    // ===========================================
    async getUsers(params: {
        page?: number;
        limit?: number;
        role?: UserRole;
        search?: string;
        isBlocked?: boolean;
        isVerified?: boolean;
    }) {
        const { page = 1, limit = 20, role, search, isBlocked, isVerified } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (role) {
            where.role = role;
        }

        if (typeof isBlocked === 'boolean') {
            where.isBlocked = isBlocked;
        }

        if (typeof isVerified === 'boolean') {
            where.isVerified = isVerified;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { companyName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    avatar: true,
                    companyName: true,
                    region: true,
                    isVerified: true,
                    isBlocked: true,
                    createdAt: true,
                    _count: {
                        select: {
                            jobs: true,
                            applications: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Block/Unblock user
    // ===========================================
    async toggleUserBlock(userId: string, block: boolean, reason?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        if (user.role === UserRole.ADMIN) {
            throw new BadRequestException('Admin foydalanuvchini bloklash mumkin emas');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBlocked: block,
            },
        });

        // Send notification
        await this.notificationsService.notifySystem(
            userId,
            block ? 'Akkauntingiz bloklandi' : 'Akkauntingiz blokdan chiqarildi',
            block
                ? `Akkauntingiz administrator tomonidan bloklandi${reason ? `: ${reason}` : ''}`
                : 'Akkauntingiz blokdan chiqarildi. Endi platformadan to\'liq foydalanishingiz mumkin.',
        );

        // If blocking, deactivate all user's jobs
        if (block && user.role === UserRole.EMPLOYER) {
            await this.prisma.job.updateMany({
                where: { employerId: userId, status: JobStatus.ACTIVE },
                data: { status: JobStatus.CLOSED },
            });
        }

        // Invalidate cache
        await this.redis.del('admin:dashboard:stats');

        return updatedUser;
    }

    // ===========================================
    // Verify user
    // ===========================================
    async verifyUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
            },
        });

        // Send notification
        await this.notificationsService.notifySystem(
            userId,
            'Akkauntingiz tasdiqlandi ✅',
            'Tabriklaymiz! Akkauntingiz administrator tomonidan tasdiqlandi.',
        );

        return updatedUser;
    }

    // ===========================================
    // Update user (admin)
    // ===========================================
    async updateUser(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        password?: string;
        role?: UserRole;
        region?: string;
        isVerified?: boolean;
        isBlocked?: boolean;
    }) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        // Prepare update data
        const updateData: any = {};

        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName !== undefined) updateData.lastName = data.lastName;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.role) updateData.role = data.role;
        if (data.region !== undefined) updateData.region = data.region;
        if (typeof data.isVerified === 'boolean') updateData.isVerified = data.isVerified;
        if (typeof data.isBlocked === 'boolean') updateData.isBlocked = data.isBlocked;

        // Hash password if provided
        if (data.password) {
            const bcrypt = await import('bcrypt');
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                avatar: true,
                region: true,
                isVerified: true,
                isBlocked: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Invalidate cache
        await this.redis.del('admin:dashboard:stats');

        return updatedUser;
    }

    // ===========================================
    // Get user by ID (admin - includes sensitive info)
    // ===========================================
    async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                region: true,
                location: true,
                skills: true,
                companyName: true,
                companyDescription: true,
                website: true,
                isVerified: true,
                isBlocked: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        jobs: true,
                        applications: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        return user;
    }

    // ===========================================
    // Get all jobs (admin)
    // ===========================================
    async getAllJobs(params: { page?: number; limit?: number; status?: string }) {
        const { page = 1, limit = 20, status } = params;
        const skip = (page - 1) * limit;

        // Status filter
        const whereClause: { status?: JobStatus } = {};
        if (status && status !== 'all') {
            whereClause.status = status.toUpperCase() as JobStatus;
        }

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    employer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            companyName: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            }),
            this.prisma.job.count({ where: whereClause }),
        ]);

        // Add applicationsCount to each job
        const jobsWithCount = jobs.map(job => ({
            ...job,
            applicationsCount: job._count?.applications || 0,
        }));

        return {
            jobs: jobsWithCount,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Get pending jobs
    // ===========================================
    async getPendingJobs(params: { page?: number; limit?: number }) {
        const { page = 1, limit = 20 } = params;
        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where: { status: JobStatus.PENDING },
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
                include: {
                    employer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            companyName: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.job.count({ where: { status: JobStatus.PENDING } }),
        ]);

        return {
            jobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Approve job
    // ===========================================
    async approveJob(jobId: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { employer: { select: { id: true } } },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        if (job.status !== JobStatus.PENDING) {
            throw new BadRequestException('Bu ish tasdiqlash holatida emas');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: JobStatus.ACTIVE,
            },
        });

        // Notify employer
        await this.notificationsService.notifyJobStatusChanged(
            job.employerId,
            job.title,
            'APPROVED',
            job.id,
        );

        // Invalidate caches
        await Promise.all([
            this.redis.del('admin:dashboard:stats'),
            this.redis.del(`job:${jobId}`),
            this.redis.del('jobs:list:*'),
        ]);

        return updatedJob;
    }

    // ===========================================
    // Reject job
    // ===========================================
    async rejectJob(jobId: string, reason: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        if (job.status !== JobStatus.PENDING) {
            throw new BadRequestException('Bu ish tasdiqlash holatida emas');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                status: JobStatus.REJECTED,
            },
        });

        // Notify employer
        await this.notificationsService.notifyJobStatusChanged(
            job.employerId,
            job.title,
            'REJECTED',
            job.id,
            reason,
        );

        // Invalidate caches
        await Promise.all([
            this.redis.del('admin:dashboard:stats'),
            this.redis.del(`job:${jobId}`),
        ]);

        return updatedJob;
    }

    // ===========================================
    // Feature/Unfeature job
    // ===========================================
    async toggleJobFeatured(jobId: string, featured: boolean) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                isFeatured: featured,
            },
        });

        // Invalidate cache
        await this.redis.del(`job:${jobId}`);

        return updatedJob;
    }

    // ===========================================
    // Broadcast notification
    // ===========================================
    async broadcastNotification(
        title: string,
        message: string,
        type: NotificationType = NotificationType.SYSTEM,
        link?: string,
    ) {
        return this.notificationsService.broadcast(title, message, type, link);
    }

    // ===========================================
    // Get system logs (simplified)
    // ===========================================
    async getSystemLogs(params: { page?: number; limit?: number }) {
        const { page = 1, limit = 50 } = params;

        // In a real application, you would have a separate logs table
        // For now, we'll return recent notifications as a proxy for activity logs

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            this.prisma.notification.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.notification.count(),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Clear all caches
    // ===========================================
    async clearAllCaches() {
        const patterns = [
            'admin:*',
            'jobs:*',
            'job:*',
            'categories:*',
            'users:*',
            'notifications:*',
            'chat:*',
        ];

        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await Promise.all(keys.map((key: string) => this.redis.del(key)));
            }
        }

        return { success: true, message: 'Barcha keshlar tozalandi' };
    }

    // ===========================================
    // Chat Management
    // ===========================================
    async getAllChats(params: { page?: number; limit?: number; search?: string }) {
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

    async getChatMessages(roomId: string, params: { page?: number; limit?: number }) {
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

    async deleteChat(roomId: string) {
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

    async deleteMessage(messageId: string) {
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

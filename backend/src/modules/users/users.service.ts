// ===========================================
// Users Service - Business Logic
// ===========================================
// Handles user operations
// Author: Vakans.uz Team
// ===========================================

import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

// User without password
export type SafeUser = Omit<User, 'password'>;

// Pagination params
export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    region?: string;
    isVerified?: boolean;
    isBlocked?: boolean;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    // ===========================================
    // GET ALL USERS (with pagination & filters)
    // ===========================================

    async findAll(params: PaginationParams) {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            region,
            isVerified,
            isBlocked,
        } = params;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.UserWhereInput = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (region) {
            where.region = region;
        }

        if (typeof isVerified === 'boolean') {
            where.isVerified = isVerified;
        }

        if (typeof isBlocked === 'boolean') {
            where.isBlocked = isBlocked;
        }

        // Execute queries in parallel
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
                    email: true,
                    bio: true,
                    region: true,
                    location: true,
                    skills: true,
                    experienceYears: true,
                    education: true,
                    languages: true,
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
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // GET USER BY ID
    // ===========================================

    async findById(id: string): Promise<SafeUser> {
        // Try cache first
        const cacheKey = `user:${id}`;
        const cached = await this.redisService.getJson<SafeUser>(cacheKey);

        if (cached) {
            return cached;
        }

        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                email: true,
                bio: true,
                region: true,
                location: true,
                skills: true,
                experienceYears: true,
                education: true,
                languages: true,
                resumeUrl: true,
                companyName: true,
                companyDescription: true,
                companyLogo: true,
                website: true,
                isVerified: true,
                isBlocked: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        // Cache for 5 minutes
        await this.redisService.setJson(cacheKey, user, 300);

        return user as SafeUser;
    }

    // ===========================================
    // UPDATE PROFILE
    // ===========================================

    async updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUser> {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        // Check if email is already taken (if changing)
        if (dto.email && dto.email !== existingUser.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (emailExists) {
                throw new BadRequestException('Bu email allaqachon band');
            }
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                bio: dto.bio,
                region: dto.region,
                location: dto.location,
                avatar: dto.avatar,
                // Worker fields
                skills: dto.skills,
                experienceYears: dto.experienceYears,
                education: dto.education,
                languages: dto.languages,
                resumeUrl: dto.resumeUrl,
                // Employer fields
                companyName: dto.companyName,
                companyDescription: dto.companyDescription,
                companyLogo: dto.companyLogo,
                website: dto.website,
            },
            select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                email: true,
                bio: true,
                region: true,
                location: true,
                skills: true,
                experienceYears: true,
                education: true,
                languages: true,
                resumeUrl: true,
                companyName: true,
                companyDescription: true,
                companyLogo: true,
                website: true,
                isVerified: true,
                isBlocked: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Invalidate cache
        await this.redisService.del(`user:${userId}`);

        this.logger.log(`Profile updated for user: ${userId}`);

        return updatedUser as SafeUser;
    }

    // ===========================================
    // VERIFY USER (Admin only)
    // ===========================================

    async verifyUser(userId: string): Promise<SafeUser> {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { isVerified: true },
        });

        // Invalidate cache
        await this.redisService.del(`user:${userId}`);

        this.logger.log(`User verified: ${userId}`);

        const { password: _, ...safeUser } = user;
        return safeUser;
    }

    // ===========================================
    // BLOCK/UNBLOCK USER (Admin only)
    // ===========================================

    async toggleBlockUser(userId: string): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { isBlocked: !user.isBlocked },
        });

        // Invalidate cache
        await this.redisService.del(`user:${userId}`);

        // If blocking, invalidate all refresh tokens
        if (updatedUser.isBlocked) {
            await this.prisma.refreshToken.deleteMany({
                where: { userId },
            });
        }

        this.logger.log(`User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}: ${userId}`);

        const { password: _, ...safeUser } = updatedUser;
        return safeUser;
    }

    // ===========================================
    // DELETE USER (Admin only)
    // ===========================================

    async deleteUser(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        // Don't allow deleting admins
        if (user.role === 'ADMIN') {
            throw new BadRequestException('Admin foydalanuvchini o\'chirish mumkin emas');
        }

        await this.prisma.user.delete({
            where: { id: userId },
        });

        // Invalidate cache
        await this.redisService.del(`user:${userId}`);

        this.logger.log(`User deleted: ${userId}`);
    }

    // ===========================================
    // GET USER STATS
    // ===========================================

    async getUserStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: {
                        jobs: true,
                        applications: true,
                        savedJobs: true,
                        notifications: { where: { isRead: false } },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Foydalanuvchi topilmadi');
        }

        return {
            jobsCount: user._count.jobs,
            applicationsCount: user._count.applications,
            savedJobsCount: user._count.savedJobs,
            unreadNotifications: user._count.notifications,
        };
    }
}

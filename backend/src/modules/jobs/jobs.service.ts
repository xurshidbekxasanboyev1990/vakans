// ===========================================
// Jobs Service - Business Logic
// ===========================================
// Handles job operations
// Author: Vakans.uz Team
// ===========================================

import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { JobStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateJobDto, JobQueryDto, UpdateJobDto } from './dto';

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    // ===========================================
    // GET ALL JOBS (with filters & pagination)
    // ===========================================

    async findAll(params: JobQueryDto, userId?: string) {
        const {
            page = 1,
            limit = 12,
            search,
            categoryId,
            region,
            workType,
            salaryMin,
            salaryMax,
            status = 'ACTIVE',
            employerId,
            isFeatured,
            isUrgent,
        } = params;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.JobWhereInput = {};

        // Only show active jobs for public (unless employer views own)
        if (!employerId) {
            where.status = status;
        } else {
            where.employerId = employerId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (region) {
            where.region = { contains: region, mode: 'insensitive' };
        }

        if (workType) {
            where.workType = workType;
        }

        if (salaryMin) {
            where.salaryMax = { gte: salaryMin };
        }

        if (salaryMax) {
            where.salaryMin = { lte: salaryMax };
        }

        if (typeof isFeatured === 'boolean') {
            where.isFeatured = isFeatured;
        }

        if (typeof isUrgent === 'boolean') {
            where.isUrgent = isUrgent;
        }

        // Execute queries in parallel
        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isFeatured: 'desc' },
                    { isUrgent: 'desc' },
                    { createdAt: 'desc' },
                ],
                include: {
                    employer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            companyName: true,
                            companyLogo: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                        },
                    },
                    _count: {
                        select: {
                            applications: true,
                        },
                    },
                },
            }),
            this.prisma.job.count({ where }),
        ]);

        // Add user-specific data if userId provided
        let enrichedJobs = jobs;
        if (userId) {
            const [savedJobs, reactions, applications] = await Promise.all([
                this.prisma.savedJob.findMany({
                    where: {
                        userId,
                        jobId: { in: jobs.map((j) => j.id) },
                    },
                    select: { jobId: true },
                }),
                this.prisma.jobReaction.findMany({
                    where: {
                        userId,
                        jobId: { in: jobs.map((j) => j.id) },
                    },
                    select: { jobId: true, isLike: true },
                }),
                this.prisma.application.findMany({
                    where: {
                        workerId: userId,
                        jobId: { in: jobs.map((j) => j.id) },
                    },
                    select: { jobId: true },
                }),
            ]);

            const savedJobIds = new Set(savedJobs.map((s) => s.jobId));
            const reactionMap = new Map(reactions.map((r) => [r.jobId, r.isLike ? 'like' : 'dislike']));
            const appliedJobIds = new Set(applications.map((a) => a.jobId));

            enrichedJobs = jobs.map((job) => ({
                ...job,
                isSaved: savedJobIds.has(job.id),
                userReaction: reactionMap.get(job.id) || null,
                hasApplied: appliedJobIds.has(job.id),
            }));
        }

        // Transform to match frontend types
        const transformedJobs = enrichedJobs.map((job) => ({
            id: job.id,
            employerId: job.employerId,
            categoryId: job.categoryId,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryType: job.salaryType,
            currency: job.currency,
            location: job.location,
            region: job.region,
            workType: job.workType,
            experienceRequired: job.experienceRequired,
            educationRequired: job.educationRequired,
            languagesRequired: job.languagesRequired,
            contactPhone: job.contactPhone,
            contactEmail: job.contactEmail,
            isFeatured: job.isFeatured,
            isUrgent: job.isUrgent,
            status: job.status,
            viewsCount: job.viewsCount,
            applicationsCount: job._count.applications,
            likesCount: job.likesCount,
            dislikesCount: job.dislikesCount,
            deadline: job.deadline,
            expiresAt: job.expiresAt,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            // Joined fields
            employerName: job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName || ''}`.trim(),
            employerAvatar: job.employer.companyLogo || job.employer.avatar,
            companyName: job.employer.companyName,
            categoryName: job.category?.name,
            categoryIcon: job.category?.icon,
            // User-specific fields
            isSaved: (job as any).isSaved || false,
            userReaction: (job as any).userReaction || null,
            hasApplied: (job as any).hasApplied || false,
        }));

        return {
            data: transformedJobs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // GET JOB BY ID
    // ===========================================

    async findById(id: string, userId?: string) {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: {
                employer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        companyDescription: true,
                        companyLogo: true,
                        avatar: true,
                        isVerified: true,
                        phone: true,
                        email: true,
                        website: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        // Increment view count
        await this.prisma.job.update({
            where: { id },
            data: { viewsCount: { increment: 1 } },
        });

        // Get user-specific data
        let isSaved = false;
        let userReaction: string | null = null;
        let hasApplied = false;

        if (userId) {
            const [saved, reaction, application] = await Promise.all([
                this.prisma.savedJob.findUnique({
                    where: { userId_jobId: { userId, jobId: id } },
                }),
                this.prisma.jobReaction.findUnique({
                    where: { userId_jobId: { userId, jobId: id } },
                }),
                this.prisma.application.findUnique({
                    where: { jobId_workerId: { jobId: id, workerId: userId } },
                }),
            ]);

            isSaved = !!saved;
            userReaction = reaction ? (reaction.isLike ? 'like' : 'dislike') : null;
            hasApplied = !!application;
        }

        return {
            id: job.id,
            employerId: job.employerId,
            categoryId: job.categoryId,
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryType: job.salaryType,
            currency: job.currency,
            location: job.location,
            region: job.region,
            address: job.address,
            workType: job.workType,
            experienceRequired: job.experienceRequired,
            educationRequired: job.educationRequired,
            languagesRequired: job.languagesRequired,
            contactPhone: job.contactPhone || job.employer.phone,
            contactEmail: job.contactEmail || job.employer.email,
            isFeatured: job.isFeatured,
            isUrgent: job.isUrgent,
            status: job.status,
            viewsCount: job.viewsCount + 1,
            applicationsCount: job._count.applications,
            likesCount: job.likesCount,
            dislikesCount: job.dislikesCount,
            deadline: job.deadline,
            expiresAt: job.expiresAt,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            // Joined fields
            employerName: job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName || ''}`.trim(),
            employerAvatar: job.employer.companyLogo || job.employer.avatar,
            companyName: job.employer.companyName,
            companyDescription: job.employer.companyDescription,
            employerVerified: job.employer.isVerified,
            employerWebsite: job.employer.website,
            categoryName: job.category?.name,
            categoryIcon: job.category?.icon,
            // User-specific
            isSaved,
            userReaction,
            hasApplied,
        };
    }

    // ===========================================
    // CREATE JOB
    // ===========================================

    async create(employerId: string, dto: CreateJobDto) {
        const job = await this.prisma.job.create({
            data: {
                employerId,
                categoryId: dto.categoryId,
                title: dto.title,
                description: dto.description,
                requirements: dto.requirements || [],
                benefits: dto.benefits || [],
                salaryMin: dto.salaryMin,
                salaryMax: dto.salaryMax,
                salaryType: dto.salaryType,
                currency: dto.currency || 'UZS',
                location: dto.location,
                region: dto.region,
                address: dto.address,
                workType: dto.workType,
                experienceRequired: dto.experienceRequired,
                educationRequired: dto.educationRequired,
                languagesRequired: dto.languagesRequired || [],
                contactPhone: dto.contactPhone,
                contactEmail: dto.contactEmail,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                status: 'PENDING', // Needs admin approval
            },
            include: {
                employer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        icon: true,
                    },
                },
            },
        });

        this.logger.log(`New job created: ${job.id} by employer: ${employerId}`);

        return {
            ...job,
            employerName: job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName || ''}`.trim(),
            categoryName: job.category?.name,
            categoryIcon: job.category?.icon,
        };
    }

    // ===========================================
    // UPDATE JOB
    // ===========================================

    async update(id: string, userId: string, userRole: UserRole, dto: UpdateJobDto) {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        // Check ownership (unless admin)
        if (job.employerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('Bu ishni tahrirlash huquqi yo\'q');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id },
            data: {
                categoryId: dto.categoryId,
                title: dto.title,
                description: dto.description,
                requirements: dto.requirements,
                benefits: dto.benefits,
                salaryMin: dto.salaryMin,
                salaryMax: dto.salaryMax,
                salaryType: dto.salaryType,
                currency: dto.currency,
                location: dto.location,
                region: dto.region,
                address: dto.address,
                workType: dto.workType,
                experienceRequired: dto.experienceRequired,
                educationRequired: dto.educationRequired,
                languagesRequired: dto.languagesRequired,
                contactPhone: dto.contactPhone,
                contactEmail: dto.contactEmail,
                isFeatured: dto.isFeatured,
                isUrgent: dto.isUrgent,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                // Reset status if edited by employer
                status: userRole === 'ADMIN' ? dto.status : 'PENDING',
            },
            include: {
                employer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                        icon: true,
                    },
                },
            },
        });

        this.logger.log(`Job updated: ${id}`);

        return {
            ...updatedJob,
            employerName: updatedJob.employer.companyName ||
                `${updatedJob.employer.firstName} ${updatedJob.employer.lastName || ''}`.trim(),
            categoryName: updatedJob.category?.name,
            categoryIcon: updatedJob.category?.icon,
        };
    }

    // ===========================================
    // DELETE JOB
    // ===========================================

    async delete(id: string, userId: string, userRole: UserRole) {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        // Check ownership (unless admin)
        if (job.employerId !== userId && userRole !== 'ADMIN') {
            throw new ForbiddenException('Bu ishni o\'chirish huquqi yo\'q');
        }

        await this.prisma.job.delete({
            where: { id },
        });

        this.logger.log(`Job deleted: ${id}`);
    }

    // ===========================================
    // APPROVE/REJECT JOB (Admin only)
    // ===========================================

    async updateStatus(id: string, status: JobStatus, rejectionReason?: string) {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            },
        });

        this.logger.log(`Job status updated: ${id} -> ${status}`);

        return updatedJob;
    }

    // ===========================================
    // UPDATE STATUS BY OWNER OR ADMIN
    // ===========================================

    async updateStatusByOwner(id: string, status: JobStatus, userId: string, userRole: string, rejectionReason?: string) {
        const job = await this.prisma.job.findUnique({
            where: { id },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        // Admin har qanday ish statusini o'zgartira oladi
        if (userRole === 'ADMIN') {
            const updatedJob = await this.prisma.job.update({
                where: { id },
                data: {
                    status,
                    rejectionReason: status === 'REJECTED' ? rejectionReason : null,
                },
            });
            this.logger.log(`Job status updated by admin: ${id} -> ${status}`);
            return updatedJob;
        }

        // Employer faqat o'z ishining statusini o'zgartira oladi
        if (job.employerId !== userId) {
            throw new ForbiddenException('Bu ishni o\'zgartirish huquqi yo\'q');
        }

        // Employer faqat ACTIVE yoki CLOSED qila oladi
        if (status !== 'ACTIVE' && status !== 'CLOSED') {
            throw new ForbiddenException('Siz faqat ishni faollashtirish yoki to\'xtatish mumkin');
        }

        // PENDING statusdagi ishni employer faollashtira olmaydi (faqat admin tasdiqlashi kerak)
        if (job.status === 'PENDING' && status === 'ACTIVE') {
            throw new ForbiddenException('Bu ish hali admin tomonidan tasdiqlanmagan. Faqat admin tasdiqlashi kerak.');
        }

        // REJECTED statusdagi ishni employer faollashtira olmaydi
        if (job.status === 'REJECTED' && status === 'ACTIVE') {
            throw new ForbiddenException('Rad etilgan ishni faollashtirish mumkin emas');
        }

        const updatedJob = await this.prisma.job.update({
            where: { id },
            data: { status },
        });

        this.logger.log(`Job status updated by owner: ${id} -> ${status}`);

        return updatedJob;
    }

    // ===========================================
    // SAVE/UNSAVE JOB
    // ===========================================

    async toggleSave(jobId: string, userId: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        const existingSave = await this.prisma.savedJob.findUnique({
            where: { userId_jobId: { userId, jobId } },
        });

        if (existingSave) {
            await this.prisma.savedJob.delete({
                where: { id: existingSave.id },
            });
            return { saved: false };
        } else {
            await this.prisma.savedJob.create({
                data: { userId, jobId },
            });
            return { saved: true };
        }
    }

    // ===========================================
    // LIKE/DISLIKE JOB
    // ===========================================

    async reactToJob(jobId: string, userId: string, isLike: boolean) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        const existingReaction = await this.prisma.jobReaction.findUnique({
            where: { userId_jobId: { userId, jobId } },
        });

        if (existingReaction) {
            if (existingReaction.isLike === isLike) {
                // Remove reaction
                await this.prisma.jobReaction.delete({
                    where: { id: existingReaction.id },
                });

                // Update counts
                await this.prisma.job.update({
                    where: { id: jobId },
                    data: isLike
                        ? { likesCount: { decrement: 1 } }
                        : { dislikesCount: { decrement: 1 } },
                });

                return { reaction: null };
            } else {
                // Change reaction
                await this.prisma.jobReaction.update({
                    where: { id: existingReaction.id },
                    data: { isLike },
                });

                // Update counts
                await this.prisma.job.update({
                    where: { id: jobId },
                    data: isLike
                        ? { likesCount: { increment: 1 }, dislikesCount: { decrement: 1 } }
                        : { likesCount: { decrement: 1 }, dislikesCount: { increment: 1 } },
                });

                return { reaction: isLike ? 'like' : 'dislike' };
            }
        } else {
            // Create new reaction
            await this.prisma.jobReaction.create({
                data: { userId, jobId, isLike },
            });

            // Update counts
            await this.prisma.job.update({
                where: { id: jobId },
                data: isLike
                    ? { likesCount: { increment: 1 } }
                    : { dislikesCount: { increment: 1 } },
            });

            return { reaction: isLike ? 'like' : 'dislike' };
        }
    }

    // ===========================================
    // GET SAVED JOBS
    // ===========================================

    async getSavedJobs(userId: string, page?: number | string, limit?: number | string) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const [savedJobs, total] = await Promise.all([
            this.prisma.savedJob.findMany({
                where: { userId },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    job: {
                        include: {
                            employer: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    companyName: true,
                                    companyLogo: true,
                                    avatar: true,
                                },
                            },
                            category: {
                                select: {
                                    name: true,
                                    icon: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.savedJob.count({ where: { userId } }),
        ]);

        const jobs = savedJobs.map((s) => ({
            ...s.job,
            employerName: s.job.employer.companyName ||
                `${s.job.employer.firstName} ${s.job.employer.lastName || ''}`.trim(),
            employerAvatar: s.job.employer.companyLogo || s.job.employer.avatar,
            categoryName: s.job.category?.name,
            categoryIcon: s.job.category?.icon,
            isSaved: true,
        }));

        return {
            data: jobs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        };
    }

    // ===========================================
    // GET PUBLIC STATISTICS (for Landing Page)
    // ===========================================

    async getPublicStats() {
        const cacheKey = 'public:stats';
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return cached; // RedisService already parses JSON
        }

        const [
            totalJobs,
            totalUsers,
            totalCompanies,
            totalApplications,
        ] = await Promise.all([
            this.prisma.job.count({ where: { status: JobStatus.ACTIVE } }),
            this.prisma.user.count({ where: { isBlocked: false } }),
            this.prisma.user.count({ where: { role: 'EMPLOYER', isBlocked: false } }),
            this.prisma.application.count(),
        ]);

        // Calculate satisfaction rate (based on accepted applications)
        const acceptedApps = await this.prisma.application.count({
            where: { status: 'ACCEPTED' },
        });
        const satisfactionRate = totalApplications > 0
            ? Math.round((acceptedApps / totalApplications) * 100)
            : 85; // Default value if no applications yet

        const stats = {
            totalJobs,
            totalUsers,
            totalCompanies,
            satisfactionRate: Math.min(satisfactionRate + 10, 99), // Add 10% for UX, max 99%
        };

        // Cache for 5 minutes
        await this.redisService.set(cacheKey, JSON.stringify(stats), 300);

        return stats;
    }

    // ===========================================
    // GET FEATURED JOBS (for Landing Page)
    // ===========================================

    async getFeaturedJobs(limit = 6) {
        const cacheKey = `public:featured:${limit}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return cached; // RedisService already parses JSON
        }

        const jobs = await this.prisma.job.findMany({
            where: {
                status: JobStatus.ACTIVE,
            },
            orderBy: [
                { isFeatured: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            include: {
                employer: {
                    select: {
                        companyName: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        const result = jobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.employer.companyName || `${job.employer.firstName} ${job.employer.lastName || ''}`.trim(),
            salary: this.formatSalaryRange(
                job.salaryMin ? Number(job.salaryMin) : null,
                job.salaryMax ? Number(job.salaryMax) : null
            ),
            location: job.region || 'Toshkent',
            type: this.formatWorkType(job.workType),
        }));

        // Cache for 5 minutes
        await this.redisService.set(cacheKey, JSON.stringify(result), 300);

        return result;
    }

    private formatSalaryRange(min?: number | null, max?: number | null): string {
        if (!min && !max) return 'Kelishiladi';
        if (min && max) {
            return `${(min / 1000000).toFixed(0)}-${(max / 1000000).toFixed(0)}M`;
        }
        if (min) return `${(min / 1000000).toFixed(0)}M dan`;
        if (max) return `${(max / 1000000).toFixed(0)}M gacha`;
        return 'Kelishiladi';
    }

    private formatWorkType(workType: string): string {
        const types: Record<string, string> = {
            'FULL_TIME': 'To\'liq vaqt',
            'PART_TIME': 'Yarim stavka',
            'CONTRACT': 'Shartnoma',
            'INTERNSHIP': 'Amaliyot',
            'REMOTE': 'Masofaviy',
        };
        return types[workType] || workType;
    }
}

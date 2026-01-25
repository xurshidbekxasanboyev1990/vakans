// ===========================================
// Applications Service
// Full business logic for job applications
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, JobStatus, NotificationType, UserRole } from '@prisma/client';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto';

@Injectable()
export class ApplicationsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // ===========================================
    // Get all applications with filters
    // ===========================================
    async findAll(params: {
        page?: number;
        limit?: number;
        status?: ApplicationStatus;
        jobId?: string;
        workerId?: string;
        employerId?: string;
    }) {
        const { page = 1, limit = 20, status, jobId, workerId, employerId } = params;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (jobId) {
            where.jobId = jobId;
        }

        if (workerId) {
            where.workerId = workerId;
        }

        if (employerId) {
            where.job = { employerId };
        }

        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            salaryMin: true,
                            salaryMax: true,
                            salaryType: true,
                            currency: true,
                            location: true,
                            workType: true,
                            employer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    companyName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    worker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            avatar: true,
                            bio: true,
                            skills: true,
                            experienceYears: true,
                            region: true,
                        },
                    },
                },
            }),
            this.prisma.application.count({ where }),
        ]);

        return {
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Get applications for a specific job
    // ===========================================
    async findByJob(
        jobId: string,
        employerId: string,
        params: {
            page?: number;
            limit?: number;
            status?: ApplicationStatus;
        },
    ) {
        const { page = 1, limit = 20, status } = params;
        const skip = (page - 1) * limit;

        // Verify job belongs to employer
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        if (job.employerId !== employerId) {
            throw new ForbiddenException('Sizda bu ishni ko\'rish huquqi yo\'q');
        }

        const where: any = { jobId };
        if (status) {
            where.status = status;
        }

        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    worker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            avatar: true,
                            bio: true,
                            skills: true,
                            experienceYears: true,
                            education: true,
                            languages: true,
                            region: true,
                        },
                    },
                },
            }),
            this.prisma.application.count({ where }),
        ]);

        return {
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Get applications for a worker
    // ===========================================
    async findByWorker(
        workerId: string,
        params: {
            page?: number;
            limit?: number;
            status?: ApplicationStatus;
        },
    ) {
        const { page = 1, limit = 20, status } = params;
        const skip = (page - 1) * limit;

        const where: any = { workerId };
        if (status) {
            where.status = status;
        }

        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            salaryMin: true,
                            salaryMax: true,
                            salaryType: true,
                            currency: true,
                            location: true,
                            region: true,
                            workType: true,
                            status: true,
                            employer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    companyName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.application.count({ where }),
        ]);

        return {
            applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // Get single application
    // ===========================================
    async findOne(id: string, userId: string, userRole: UserRole) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    include: {
                        employer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                companyName: true,
                                avatar: true,
                                phone: true,
                            },
                        },
                        category: true,
                    },
                },
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        avatar: true,
                        bio: true,
                        skills: true,
                        experienceYears: true,
                        education: true,
                        languages: true,
                        region: true,
                    },
                },
            },
        });

        if (!application) {
            throw new NotFoundException('Ariza topilmadi');
        }

        // Check access
        const isWorker = application.workerId === userId;
        const isEmployer = application.job.employerId === userId;
        const isAdmin = userRole === UserRole.ADMIN;

        if (!isWorker && !isEmployer && !isAdmin) {
            throw new ForbiddenException('Sizda bu arizani ko\'rish huquqi yo\'q');
        }

        // Hide employer notes from worker
        if (isWorker && !isAdmin) {
            application.employerNotes = null;
        }

        return application;
    }

    // ===========================================
    // Create new application
    // ===========================================
    async create(workerId: string, createDto: CreateApplicationDto) {
        const { jobId, coverLetter, resumeUrl } = createDto;

        // Check if job exists and is active
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                employer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!job) {
            throw new NotFoundException('Ish topilmadi');
        }

        if (job.status !== JobStatus.ACTIVE) {
            throw new BadRequestException('Bu ish hozirda faol emas');
        }

        // Check if deadline passed
        if (job.deadline && new Date(job.deadline) < new Date()) {
            throw new BadRequestException('Ariza topshirish muddati o\'tgan');
        }

        // Check if already applied
        const existingApplication = await this.prisma.application.findFirst({
            where: {
                jobId,
                workerId,
            },
        });

        if (existingApplication) {
            throw new ConflictException('Siz bu ishga allaqachon ariza topshirgansiz');
        }

        // Create application and update job applications count
        const [application] = await this.prisma.$transaction([
            this.prisma.application.create({
                data: {
                    jobId,
                    workerId,
                    coverLetter,
                    resumeUrl,
                    status: ApplicationStatus.PENDING,
                },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            employer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                },
                            },
                        },
                    },
                    worker: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
            this.prisma.job.update({
                where: { id: jobId },
                data: {
                    applicationsCount: { increment: 1 },
                },
            }),
        ]);

        // Create notification for employer
        await this.createApplicationNotification(
            job.employerId,
            `Yangi ariza: ${application.worker.firstName} "${job.title}" ishiga ariza topshirdi`,
            NotificationType.APPLICATION,
            {
                applicationId: application.id,
                jobId: job.id,
            },
        );

        // Invalidate cache
        await this.redis.del(`job:${jobId}`);

        return application;
    }

    // ===========================================
    // Update application status
    // ===========================================
    async updateStatus(
        id: string,
        employerId: string,
        updateDto: UpdateApplicationStatusDto,
    ) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        employerId: true,
                    },
                },
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                    },
                },
            },
        });

        if (!application) {
            throw new NotFoundException('Ariza topilmadi');
        }

        if (application.job.employerId !== employerId) {
            throw new ForbiddenException('Sizda bu arizani o\'zgartirish huquqi yo\'q');
        }

        // Validate status transition
        const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
            [ApplicationStatus.PENDING]: [
                ApplicationStatus.VIEWED,
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
            ],
            [ApplicationStatus.VIEWED]: [
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.REJECTED,
            ],
            [ApplicationStatus.ACCEPTED]: [ApplicationStatus.REJECTED],
            [ApplicationStatus.REJECTED]: [],
            [ApplicationStatus.WITHDRAWN]: [],
        };

        if (!validTransitions[application.status].includes(updateDto.status)) {
            throw new BadRequestException(
                `${application.status} holatidan ${updateDto.status} holatiga o'tish mumkin emas`,
            );
        }

        const updatedApplication = await this.prisma.application.update({
            where: { id },
            data: {
                status: updateDto.status,
                employerNotes: updateDto.employerNotes,
                rejectionReason:
                    updateDto.status === ApplicationStatus.REJECTED
                        ? updateDto.rejectionReason
                        : undefined,
                viewedAt:
                    updateDto.status === ApplicationStatus.VIEWED
                        ? new Date()
                        : application.viewedAt,
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                worker: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Create notification for worker
        let message = '';
        switch (updateDto.status) {
            case ApplicationStatus.VIEWED:
                message = `Arizangiz ko'rib chiqildi: "${application.job.title}"`;
                break;
            case ApplicationStatus.ACCEPTED:
                message = `Tabriklaymiz! "${application.job.title}" ishiga arizangiz qabul qilindi`;
                break;
            case ApplicationStatus.REJECTED:
                message = `Afsus, "${application.job.title}" ishiga arizangiz rad etildi`;
                break;
        }

        if (message) {
            await this.createApplicationNotification(
                application.workerId,
                message,
                NotificationType.APPLICATION,
                {
                    applicationId: application.id,
                    jobId: application.job.id,
                    status: updateDto.status,
                },
            );
        }

        return updatedApplication;
    }

    // ===========================================
    // Withdraw application (by worker)
    // ===========================================
    async withdraw(id: string, workerId: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        employerId: true,
                    },
                },
            },
        });

        if (!application) {
            throw new NotFoundException('Ariza topilmadi');
        }

        if (application.workerId !== workerId) {
            throw new ForbiddenException('Sizda bu arizani bekor qilish huquqi yo\'q');
        }

        if (
            application.status === ApplicationStatus.WITHDRAWN ||
            application.status === ApplicationStatus.ACCEPTED
        ) {
            throw new BadRequestException('Bu arizani bekor qilib bo\'lmaydi');
        }

        const [updatedApplication] = await this.prisma.$transaction([
            this.prisma.application.update({
                where: { id },
                data: {
                    status: ApplicationStatus.WITHDRAWN,
                },
            }),
            this.prisma.job.update({
                where: { id: application.jobId },
                data: {
                    applicationsCount: { decrement: 1 },
                },
            }),
        ]);

        // Invalidate cache
        await this.redis.del(`job:${application.jobId}`);

        return updatedApplication;
    }

    // ===========================================
    // Get application statistics
    // ===========================================
    async getStats(userId: string, userRole: UserRole) {
        if (userRole === UserRole.WORKER) {
            const stats = await this.prisma.application.groupBy({
                by: ['status'],
                where: { workerId: userId },
                _count: true,
            });

            return {
                total: stats.reduce((acc, s) => acc + s._count, 0),
                pending: stats.find((s) => s.status === ApplicationStatus.PENDING)?._count || 0,
                viewed: stats.find((s) => s.status === ApplicationStatus.VIEWED)?._count || 0,
                accepted: stats.find((s) => s.status === ApplicationStatus.ACCEPTED)?._count || 0,
                rejected: stats.find((s) => s.status === ApplicationStatus.REJECTED)?._count || 0,
                withdrawn: stats.find((s) => s.status === ApplicationStatus.WITHDRAWN)?._count || 0,
            };
        }

        if (userRole === UserRole.EMPLOYER) {
            const stats = await this.prisma.application.groupBy({
                by: ['status'],
                where: {
                    job: { employerId: userId },
                },
                _count: true,
            });

            return {
                total: stats.reduce((acc, s) => acc + s._count, 0),
                pending: stats.find((s) => s.status === ApplicationStatus.PENDING)?._count || 0,
                viewed: stats.find((s) => s.status === ApplicationStatus.VIEWED)?._count || 0,
                accepted: stats.find((s) => s.status === ApplicationStatus.ACCEPTED)?._count || 0,
                rejected: stats.find((s) => s.status === ApplicationStatus.REJECTED)?._count || 0,
                withdrawn: stats.find((s) => s.status === ApplicationStatus.WITHDRAWN)?._count || 0,
            };
        }

        // Admin - all applications
        const stats = await this.prisma.application.groupBy({
            by: ['status'],
            _count: true,
        });

        return {
            total: stats.reduce((acc, s) => acc + s._count, 0),
            pending: stats.find((s) => s.status === ApplicationStatus.PENDING)?._count || 0,
            viewed: stats.find((s) => s.status === ApplicationStatus.VIEWED)?._count || 0,
            accepted: stats.find((s) => s.status === ApplicationStatus.ACCEPTED)?._count || 0,
            rejected: stats.find((s) => s.status === ApplicationStatus.REJECTED)?._count || 0,
            withdrawn: stats.find((s) => s.status === ApplicationStatus.WITHDRAWN)?._count || 0,
        };
    }

    // ===========================================
    // Check if user has applied to job
    // ===========================================
    async hasApplied(jobId: string, workerId: string): Promise<boolean> {
        const application = await this.prisma.application.findFirst({
            where: {
                jobId,
                workerId,
                status: { not: ApplicationStatus.WITHDRAWN },
            },
        });

        return !!application;
    }

    // ===========================================
    // Helper: Create notification
    // ===========================================
    private async createApplicationNotification(
        userId: string,
        message: string,
        type: NotificationType,
        data: any,
    ) {
        try {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title: type === NotificationType.APPLICATION ? 'Ariza yangilandi' : 'Bildirishnoma',
                    message,
                    data,
                },
            });

            // Publish to Redis for real-time delivery
            await this.redis.publish('notifications', {
                userId,
                type,
                message,
                data,
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    }
}

// ===========================================
// Reports Service
// Shikoyatlar bilan ishlash
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus, ReportType } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreateReportDto {
    type: ReportType;
    reason: string;
    description?: string;
    reportedId?: string;
    jobId?: string;
}

interface UpdateReportDto {
    status?: ReportStatus;
    adminNote?: string;
}

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    // ===========================================
    // CREATE REPORT
    // ===========================================
    async create(reporterId: string, dto: CreateReportDto) {
        return this.prisma.report.create({
            data: {
                type: dto.type,
                reason: dto.reason,
                description: dto.description,
                reporterId,
                reportedId: dto.reportedId,
                jobId: dto.jobId,
            },
        });
    }

    // ===========================================
    // GET ALL REPORTS (ADMIN)
    // ===========================================
    async findAll(params: {
        page?: number;
        limit?: number;
        status?: ReportStatus;
        type?: ReportType;
        search?: string;
    }) {
        const { page = 1, limit = 20, status, type, search } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ReportWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (type) {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { reason: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.report.count({ where }),
        ]);

        // Get reporter and reported user info
        const reporterIds = reports.map(r => r.reporterId);
        const reportedIds = reports.filter(r => r.reportedId).map(r => r.reportedId as string);
        const jobIds = reports.filter(r => r.jobId).map(r => r.jobId as string);

        const [reporters, reportedUsers, jobs] = await Promise.all([
            this.prisma.user.findMany({
                where: { id: { in: reporterIds } },
                select: { id: true, firstName: true, lastName: true, companyName: true, role: true },
            }),
            reportedIds.length > 0
                ? this.prisma.user.findMany({
                    where: { id: { in: reportedIds } },
                    select: { id: true, firstName: true, lastName: true, companyName: true, role: true },
                })
                : [],
            jobIds.length > 0
                ? this.prisma.job.findMany({
                    where: { id: { in: jobIds } },
                    select: { id: true, title: true },
                })
                : [],
        ]);

        const enrichedReports = reports.map(report => {
            const reporter = reporters.find(u => u.id === report.reporterId);
            const reported = report.reportedId ? reportedUsers.find(u => u.id === report.reportedId) : null;
            const job = report.jobId ? jobs.find(j => j.id === report.jobId) : null;

            return {
                ...report,
                reporter: reporter
                    ? reporter.companyName || `${reporter.firstName} ${reporter.lastName || ''}`.trim()
                    : 'Noma\'lum',
                reported: reported
                    ? reported.companyName || `${reported.firstName} ${reported.lastName || ''}`.trim()
                    : report.reportedId ? 'O\'chirilgan foydalanuvchi' : null,
                jobTitle: job?.title || null,
            };
        });

        return {
            reports: enrichedReports,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ===========================================
    // GET REPORT BY ID
    // ===========================================
    async findOne(id: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
        });

        if (!report) {
            throw new NotFoundException('Shikoyat topilmadi');
        }

        return report;
    }

    // ===========================================
    // UPDATE REPORT STATUS (ADMIN)
    // ===========================================
    async update(id: string, adminId: string, dto: UpdateReportDto) {
        const report = await this.findOne(id);

        const data: Prisma.ReportUpdateInput = {};

        if (dto.status) {
            data.status = dto.status;
            if (dto.status === 'RESOLVED' || dto.status === 'DISMISSED') {
                data.resolvedAt = new Date();
                data.resolvedBy = adminId;
            }
        }

        if (dto.adminNote !== undefined) {
            data.adminNote = dto.adminNote;
        }

        return this.prisma.report.update({
            where: { id: report.id },
            data,
        });
    }

    // ===========================================
    // DELETE REPORT
    // ===========================================
    async delete(id: string) {
        const report = await this.findOne(id);
        await this.prisma.report.delete({ where: { id: report.id } });
        return { success: true };
    }

    // ===========================================
    // GET STATS
    // ===========================================
    async getStats() {
        const [total, newCount, reviewingCount, resolvedCount, dismissedCount] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.count({ where: { status: 'NEW' } }),
            this.prisma.report.count({ where: { status: 'REVIEWING' } }),
            this.prisma.report.count({ where: { status: 'RESOLVED' } }),
            this.prisma.report.count({ where: { status: 'DISMISSED' } }),
        ]);

        return {
            total,
            new: newCount,
            reviewing: reviewingCount,
            resolved: resolvedCount,
            dismissed: dismissedCount,
        };
    }
}

// ===========================================
// Reports Controller
// Shikoyatlar API endpoints
// ===========================================

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ReportStatus, ReportType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    // ===========================================
    // CREATE REPORT (any user)
    // ===========================================
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Shikoyat yaratish' })
    @ApiResponse({ status: 201, description: 'Shikoyat yaratildi' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: {
            type: ReportType;
            reason: string;
            description?: string;
            reportedId?: string;
            jobId?: string;
        },
    ) {
        const report = await this.reportsService.create(userId, dto);
        return {
            success: true,
            data: report,
        };
    }

    // ===========================================
    // GET ALL REPORTS (Admin only)
    // ===========================================
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Barcha shikoyatlar (Admin)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
    @ApiQuery({ name: 'type', required: false, enum: ReportType })
    @ApiQuery({ name: 'search', required: false })
    @ApiResponse({ status: 200, description: 'Shikoyatlar ro\'yxati' })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ReportStatus,
        @Query('type') type?: ReportType,
        @Query('search') search?: string,
    ) {
        const result = await this.reportsService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            status,
            type,
            search,
        });

        return {
            success: true,
            data: result.reports,
            pagination: result.pagination,
        };
    }

    // ===========================================
    // GET REPORT STATS (Admin only)
    // ===========================================
    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Shikoyatlar statistikasi (Admin)' })
    @ApiResponse({ status: 200, description: 'Statistika' })
    async getStats() {
        const stats = await this.reportsService.getStats();
        return {
            success: true,
            data: stats,
        };
    }

    // ===========================================
    // GET REPORT BY ID
    // ===========================================
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Shikoyat ma\'lumotlari' })
    @ApiResponse({ status: 200, description: 'Shikoyat' })
    async findOne(@Param('id') id: string) {
        const report = await this.reportsService.findOne(id);
        return {
            success: true,
            data: report,
        };
    }

    // ===========================================
    // UPDATE REPORT (Admin only)
    // ===========================================
    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Shikoyatni yangilash (Admin)' })
    @ApiResponse({ status: 200, description: 'Yangilandi' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') adminId: string,
        @Body() dto: { status?: ReportStatus; adminNote?: string },
    ) {
        const report = await this.reportsService.update(id, adminId, dto);
        return {
            success: true,
            data: report,
        };
    }

    // ===========================================
    // DELETE REPORT (Admin only)
    // ===========================================
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Shikoyatni o\'chirish (Admin)' })
    @ApiResponse({ status: 200, description: 'O\'chirildi' })
    async delete(@Param('id') id: string) {
        await this.reportsService.delete(id);
        return {
            success: true,
            message: 'Shikoyat o\'chirildi',
        };
    }
}

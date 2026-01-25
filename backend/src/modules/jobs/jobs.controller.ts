// ===========================================
// Jobs Controller - API Endpoints
// ===========================================
// Handles job HTTP requests
// Author: Vakans.uz Team
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
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateJobDto, JobQueryDto, UpdateJobDto, UpdateJobStatusDto } from './dto';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    // ===========================================
    // GET PUBLIC STATS (for Landing Page)
    // ===========================================

    @Get('public/stats')
    @Public()
    @ApiOperation({ summary: 'Public statistika (Landing Page uchun)' })
    @ApiResponse({ status: 200, description: 'Statistika ma\'lumotlari' })
    async getPublicStats() {
        const stats = await this.jobsService.getPublicStats();
        return {
            success: true,
            data: stats,
        };
    }

    // ===========================================
    // GET FEATURED JOBS (for Landing Page)
    // ===========================================

    @Get('public/featured')
    @Public()
    @ApiOperation({ summary: 'Featured ishlar (Landing Page uchun)' })
    @ApiResponse({ status: 200, description: 'Featured ishlar' })
    async getFeaturedJobs(@Query('limit') limit?: number) {
        const jobs = await this.jobsService.getFeaturedJobs(limit || 6);
        return {
            success: true,
            data: jobs,
        };
    }

    // ===========================================
    // GET ALL JOBS (Public)
    // ===========================================

    @Get()
    @Public()
    @ApiOperation({ summary: 'Barcha ishlar (Public)' })
    @ApiResponse({ status: 200, description: 'Ishlar ro\'yxati' })
    async findAll(@Query() query: JobQueryDto) {
        const result = await this.jobsService.findAll(query);
        return {
            success: true,
            ...result,
        };
    }

    // ===========================================
    // GET MY JOBS (Employer)
    // ===========================================

    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Mening e\'lonlarim (Employer)' })
    @ApiResponse({ status: 200, description: 'Ishlar ro\'yxati' })
    async findMyJobs(
        @CurrentUser() user: User,
        @Query() query: JobQueryDto,
    ) {
        const result = await this.jobsService.findAll({ ...query, employerId: user.id }, user.id);
        return {
            success: true,
            ...result,
        };
    }

    // ===========================================
    // GET SAVED JOBS (Worker)
    // ===========================================

    @Get('saved')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Saqlangan ishlar' })
    @ApiResponse({ status: 200, description: 'Saqlangan ishlar' })
    async getSavedJobs(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        const result = await this.jobsService.getSavedJobs(user.id, page, limit);
        return {
            success: true,
            ...result,
        };
    }

    // ===========================================
    // GET JOB BY ID (Public, but with optional user data)
    // ===========================================

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Ish ma\'lumotlari (Public, optional auth)' })
    @ApiResponse({ status: 200, description: 'Ish topildi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async findById(
        @Param('id') id: string,
        @CurrentUser() user?: User,
    ) {
        const job = await this.jobsService.findById(id, user?.id);
        return {
            success: true,
            data: job,
        };
    }

    // ===========================================
    // CREATE JOB (Employer or Admin)
    // ===========================================

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.EMPLOYER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yangi ish e\'loni (Employer yoki Admin)' })
    @ApiResponse({ status: 201, description: 'Ish yaratildi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri ma\'lumotlar' })
    async create(
        @CurrentUser() user: User,
        @Body() dto: CreateJobDto,
    ) {
        const job = await this.jobsService.create(user.id, dto);
        return {
            success: true,
            data: job,
            message: 'Ish e\'loni yaratildi. Admin tasdiqlashini kuting.',
        };
    }

    // ===========================================
    // UPDATE JOB
    // ===========================================

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Ishni yangilash' })
    @ApiResponse({ status: 200, description: 'Ish yangilandi' })
    @ApiResponse({ status: 403, description: 'Ruxsat yo\'q' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body() dto: UpdateJobDto,
    ) {
        const job = await this.jobsService.update(id, user.id, user.role, dto);
        return {
            success: true,
            data: job,
            message: 'Ish yangilandi',
        };
    }

    // ===========================================
    // DELETE JOB
    // ===========================================

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Ishni o\'chirish' })
    @ApiResponse({ status: 200, description: 'Ish o\'chirildi' })
    @ApiResponse({ status: 403, description: 'Ruxsat yo\'q' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        await this.jobsService.delete(id, user.id, user.role);
        return {
            success: true,
            message: 'Ish o\'chirildi',
        };
    }

    // ===========================================
    // UPDATE JOB STATUS (Admin or Owner)
    // ===========================================

    @Put(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Ish statusini o\'zgartirish (Admin yoki ish egasi)' })
    @ApiResponse({ status: 200, description: 'Status o\'zgartirildi' })
    @ApiResponse({ status: 403, description: 'Ruxsat yo\'q' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateJobStatusDto,
        @CurrentUser() user: User,
    ) {
        const job = await this.jobsService.updateStatusByOwner(id, dto.status, user.id, user.role, dto.rejectionReason);
        return {
            success: true,
            data: job,
            message: `Ish statusi: ${dto.status}`,
        };
    }

    // ===========================================
    // TOGGLE SAVE JOB
    // ===========================================

    @Post(':id/save')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Ishni saqlash/o\'chirish' })
    @ApiResponse({ status: 200, description: 'Holat o\'zgartirildi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async toggleSave(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        const result = await this.jobsService.toggleSave(id, user.id);
        return {
            success: true,
            data: result,
            message: result.saved ? 'Ish saqlandi' : 'Ish o\'chirildi',
        };
    }

    // ===========================================
    // LIKE JOB
    // ===========================================

    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Ishni yoqtirish' })
    @ApiResponse({ status: 200, description: 'Like qo\'shildi' })
    async likeJob(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        const result = await this.jobsService.reactToJob(id, user.id, true);
        return {
            success: true,
            data: result,
        };
    }

    // ===========================================
    // DISLIKE JOB
    // ===========================================

    @Post(':id/dislike')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Ishni yoqtirmaslik' })
    @ApiResponse({ status: 200, description: 'Dislike qo\'shildi' })
    async dislikeJob(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        const result = await this.jobsService.reactToJob(id, user.id, false);
        return {
            success: true,
            data: result,
        };
    }
}

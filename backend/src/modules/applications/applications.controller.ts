// ===========================================
// Applications Controller
// RESTful API for job applications
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
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    // ===========================================
    // Get my applications (for workers)
    // ===========================================
    @Get('my')
    @Roles(UserRole.WORKER)
    @ApiOperation({ summary: 'Mening arizalarim (ishchi)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
    @ApiResponse({ status: 200, description: 'Arizalar ro\'yxati' })
    async getMyApplications(
        @CurrentUser('id') workerId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ApplicationStatus,
    ) {
        return this.applicationsService.findByWorker(workerId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            status,
        });
    }

    // ===========================================
    // Get applications for my jobs (for employers)
    // ===========================================
    @Get('received')
    @Roles(UserRole.EMPLOYER)
    @ApiOperation({ summary: 'Mening ishlarimga kelgan arizalar (ish beruvchi)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
    @ApiQuery({ name: 'jobId', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Arizalar ro\'yxati' })
    async getReceivedApplications(
        @CurrentUser('id') employerId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ApplicationStatus,
        @Query('jobId') jobId?: string,
    ) {
        return this.applicationsService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            status,
            jobId,
            employerId,
        });
    }

    // ===========================================
    // Get applications for a specific job
    // ===========================================
    @Get('job/:jobId')
    @Roles(UserRole.EMPLOYER)
    @ApiOperation({ summary: 'Ma\'lum ishga kelgan arizalar' })
    @ApiParam({ name: 'jobId', description: 'Ish ID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
    @ApiResponse({ status: 200, description: 'Arizalar ro\'yxati' })
    async getJobApplications(
        @Param('jobId') jobId: string,
        @CurrentUser('id') employerId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ApplicationStatus,
    ) {
        return this.applicationsService.findByJob(jobId, employerId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            status,
        });
    }

    // ===========================================
    // Get application statistics
    // ===========================================
    @Get('stats')
    @ApiOperation({ summary: 'Ariza statistikasi' })
    @ApiResponse({ status: 200, description: 'Statistika' })
    async getStats(
        @CurrentUser('id') userId: string,
        @CurrentUser('role') userRole: UserRole,
    ) {
        return this.applicationsService.getStats(userId, userRole);
    }

    // ===========================================
    // Get single application
    // ===========================================
    @Get(':id')
    @ApiOperation({ summary: 'Ariza ma\'lumotlari' })
    @ApiParam({ name: 'id', description: 'Ariza ID' })
    @ApiResponse({ status: 200, description: 'Ariza topildi' })
    @ApiResponse({ status: 404, description: 'Ariza topilmadi' })
    async getApplication(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @CurrentUser('role') userRole: UserRole,
    ) {
        return this.applicationsService.findOne(id, userId, userRole);
    }

    // ===========================================
    // Apply to a job
    // ===========================================
    @Post()
    @Roles(UserRole.WORKER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Ishga ariza topshirish' })
    @ApiResponse({ status: 201, description: 'Ariza topshirildi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri ma\'lumotlar' })
    @ApiResponse({ status: 409, description: 'Allaqachon ariza topshirilgan' })
    async applyToJob(
        @CurrentUser('id') workerId: string,
        @Body() createDto: CreateApplicationDto,
    ) {
        return this.applicationsService.create(workerId, createDto);
    }

    // ===========================================
    // Update application status
    // ===========================================
    @Put(':id/status')
    @Roles(UserRole.EMPLOYER)
    @ApiOperation({ summary: 'Ariza holatini o\'zgartirish' })
    @ApiParam({ name: 'id', description: 'Ariza ID' })
    @ApiResponse({ status: 200, description: 'Holat o\'zgartirildi' })
    @ApiResponse({ status: 404, description: 'Ariza topilmadi' })
    @ApiResponse({ status: 403, description: 'Ruxsat berilmagan' })
    async updateStatus(
        @Param('id') id: string,
        @CurrentUser('id') employerId: string,
        @Body() updateDto: UpdateApplicationStatusDto,
    ) {
        return this.applicationsService.updateStatus(id, employerId, updateDto);
    }

    // ===========================================
    // Withdraw application
    // ===========================================
    @Delete(':id')
    @Roles(UserRole.WORKER)
    @ApiOperation({ summary: 'Arizani bekor qilish' })
    @ApiParam({ name: 'id', description: 'Ariza ID' })
    @ApiResponse({ status: 200, description: 'Ariza bekor qilindi' })
    @ApiResponse({ status: 404, description: 'Ariza topilmadi' })
    @ApiResponse({ status: 403, description: 'Ruxsat berilmagan' })
    async withdrawApplication(
        @Param('id') id: string,
        @CurrentUser('id') workerId: string,
    ) {
        return this.applicationsService.withdraw(id, workerId);
    }

    // ===========================================
    // Check if already applied (for frontend)
    // ===========================================
    @Get('check/:jobId')
    @Roles(UserRole.WORKER)
    @ApiOperation({ summary: 'Ariza topshirilganmi tekshirish' })
    @ApiParam({ name: 'jobId', description: 'Ish ID' })
    @ApiResponse({ status: 200, description: 'Natija' })
    async checkApplied(
        @Param('jobId') jobId: string,
        @CurrentUser('id') workerId: string,
    ) {
        const hasApplied = await this.applicationsService.hasApplied(jobId, workerId);
        return { hasApplied };
    }
}

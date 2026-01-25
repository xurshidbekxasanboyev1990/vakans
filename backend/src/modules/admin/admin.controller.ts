// ===========================================
// Admin Controller
// Administrative API endpoints
// ===========================================

import {
    Body,
    Controller,
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
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import {
    AdminUpdateUserDto,
    BlockUserDto,
    BroadcastNotificationDto,
    RejectJobDto,
} from './dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ===========================================
    // Dashboard Statistics
    // ===========================================
    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard statistikasi' })
    @ApiResponse({ status: 200, description: 'Statistika ma\'lumotlari' })
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    // ===========================================
    // Analytics
    // ===========================================
    @Get('analytics')
    @ApiOperation({ summary: 'Analitika ma\'lumotlari' })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['week', 'month', 'year'],
        description: 'Vaqt oralig\'i',
    })
    @ApiResponse({ status: 200, description: 'Analitika' })
    async getAnalytics(@Query('period') period?: 'week' | 'month' | 'year') {
        return this.adminService.getAnalytics(period);
    }

    // ===========================================
    // Users Management
    // ===========================================
    @Get('users')
    @ApiOperation({ summary: 'Foydalanuvchilar ro\'yxati' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'isBlocked', required: false, type: Boolean })
    @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Foydalanuvchilar ro\'yxati' })
    async getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('role') role?: UserRole,
        @Query('search') search?: string,
        @Query('isBlocked') isBlocked?: string,
        @Query('isVerified') isVerified?: string,
    ) {
        return this.adminService.getUsers({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            role,
            search,
            isBlocked: isBlocked ? isBlocked === 'true' : undefined,
            isVerified: isVerified ? isVerified === 'true' : undefined,
        });
    }

    // ===========================================
    // Block User
    // ===========================================
    @Put('users/:id/block')
    @ApiOperation({ summary: 'Foydalanuvchini bloklash' })
    @ApiParam({ name: 'id', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi bloklandi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async blockUser(
        @Param('id') id: string,
        @Body() blockDto: BlockUserDto,
    ) {
        return this.adminService.toggleUserBlock(id, true, blockDto.reason);
    }

    // ===========================================
    // Unblock User
    // ===========================================
    @Put('users/:id/unblock')
    @ApiOperation({ summary: 'Foydalanuvchini blokdan chiqarish' })
    @ApiParam({ name: 'id', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi blokdan chiqarildi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async unblockUser(@Param('id') id: string) {
        return this.adminService.toggleUserBlock(id, false);
    }

    // ===========================================
    // Verify User
    // ===========================================
    @Put('users/:id/verify')
    @ApiOperation({ summary: 'Foydalanuvchini tasdiqlash' })
    @ApiParam({ name: 'id', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi tasdiqlandi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async verifyUser(@Param('id') id: string) {
        return this.adminService.verifyUser(id);
    }

    // ===========================================
    // Update User (Admin)
    // ===========================================
    @Put('users/:id')
    @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlarini yangilash' })
    @ApiParam({ name: 'id', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi yangilandi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async updateUser(
        @Param('id') id: string,
        @Body() updateDto: AdminUpdateUserDto,
    ) {
        return this.adminService.updateUser(id, updateDto);
    }

    // ===========================================
    // Get User by ID (Admin)
    // ===========================================
    @Get('users/:id')
    @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlarini olish' })
    @ApiParam({ name: 'id', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi ma\'lumotlari' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async getUserById(@Param('id') id: string) {
        return this.adminService.getUserById(id);
    }

    // ===========================================
    // All Jobs (Admin)
    // ===========================================
    @Get('jobs')
    @ApiOperation({ summary: 'Barcha ishlar (admin uchun)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Ishlar ro\'yxati' })
    async getAllJobs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.adminService.getAllJobs({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            status: status || undefined,
        });
    }

    // ===========================================
    // Pending Jobs
    // ===========================================
    @Get('jobs/pending')
    @ApiOperation({ summary: 'Kutilayotgan ishlar' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Ishlar ro\'yxati' })
    async getPendingJobs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getPendingJobs({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
        });
    }

    // ===========================================
    // Approve Job
    // ===========================================
    @Put('jobs/:id/approve')
    @ApiOperation({ summary: 'Ishni tasdiqlash' })
    @ApiParam({ name: 'id', description: 'Ish ID' })
    @ApiResponse({ status: 200, description: 'Ish tasdiqlandi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async approveJob(@Param('id') id: string) {
        return this.adminService.approveJob(id);
    }

    // ===========================================
    // Reject Job
    // ===========================================
    @Put('jobs/:id/reject')
    @ApiOperation({ summary: 'Ishni rad etish' })
    @ApiParam({ name: 'id', description: 'Ish ID' })
    @ApiResponse({ status: 200, description: 'Ish rad etildi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async rejectJob(
        @Param('id') id: string,
        @Body() rejectDto: RejectJobDto,
    ) {
        return this.adminService.rejectJob(id, rejectDto.reason);
    }

    // ===========================================
    // Feature Job
    // ===========================================
    @Put('jobs/:id/feature')
    @ApiOperation({ summary: 'Ishni tanlangan qilish' })
    @ApiParam({ name: 'id', description: 'Ish ID' })
    @ApiResponse({ status: 200, description: 'Ish tanlangan qilindi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async featureJob(@Param('id') id: string) {
        return this.adminService.toggleJobFeatured(id, true);
    }

    // ===========================================
    // Unfeature Job
    // ===========================================
    @Put('jobs/:id/unfeature')
    @ApiOperation({ summary: 'Ishni tanlanganlardan chiqarish' })
    @ApiParam({ name: 'id', description: 'Ish ID' })
    @ApiResponse({ status: 200, description: 'Ish tanlanganlardan chiqarildi' })
    @ApiResponse({ status: 404, description: 'Ish topilmadi' })
    async unfeatureJob(@Param('id') id: string) {
        return this.adminService.toggleJobFeatured(id, false);
    }

    // ===========================================
    // Broadcast Notification
    // ===========================================
    @Post('notifications/broadcast')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Barcha foydalanuvchilarga bildirishnoma yuborish' })
    @ApiResponse({ status: 200, description: 'Bildirishnoma yuborildi' })
    async broadcastNotification(@Body() broadcastDto: BroadcastNotificationDto) {
        return this.adminService.broadcastNotification(
            broadcastDto.title,
            broadcastDto.message,
            broadcastDto.type,
            broadcastDto.link,
        );
    }

    // ===========================================
    // System Logs
    // ===========================================
    @Get('logs')
    @ApiOperation({ summary: 'Tizim loglari' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Loglar ro\'yxati' })
    async getSystemLogs(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getSystemLogs({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }

    // ===========================================
    // Clear Caches
    // ===========================================
    @Post('cache/clear')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Barcha keshlarni tozalash' })
    @ApiResponse({ status: 200, description: 'Keshlar tozalandi' })
    async clearCaches() {
        return this.adminService.clearAllCaches();
    }

    // ===========================================
    // Chat Management
    // ===========================================
    @Get('chats')
    @ApiOperation({ summary: 'Barcha chatlar ro\'yxati' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Chatlar ro\'yxati' })
    async getAllChats(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminService.getAllChats({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            search,
        });
    }

    @Get('chats/:roomId')
    @ApiOperation({ summary: 'Chat xabarlari (1000 tagacha)' })
    @ApiParam({ name: 'roomId', description: 'Chat room ID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Chat xabarlari' })
    async getChatMessages(
        @Param('roomId') roomId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.adminService.getChatMessages(roomId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 100,
        });
    }

    @Post('chats/:roomId/delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Chatni o\'chirish' })
    @ApiParam({ name: 'roomId', description: 'Chat room ID' })
    @ApiResponse({ status: 200, description: 'Chat o\'chirildi' })
    async deleteChat(@Param('roomId') roomId: string) {
        return this.adminService.deleteChat(roomId);
    }

    @Post('chats/messages/:messageId/delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xabarni o\'chirish' })
    @ApiParam({ name: 'messageId', description: 'Xabar ID' })
    @ApiResponse({ status: 200, description: 'Xabar o\'chirildi' })
    async deleteMessage(@Param('messageId') messageId: string) {
        return this.adminService.deleteMessage(messageId);
    }
}

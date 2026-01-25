// ===========================================
// Notifications Controller
// REST API endpoints for notifications
// ===========================================

import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
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
import { NotificationType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // ===========================================
    // Get my notifications
    // ===========================================
    @Get()
    @ApiOperation({ summary: 'Mening bildirishnomalarim' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
    @ApiQuery({ name: 'type', required: false, enum: NotificationType })
    @ApiResponse({ status: 200, description: 'Bildirishnomalar ro\'yxati' })
    async getMyNotifications(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('unreadOnly') unreadOnly?: string,
        @Query('type') type?: NotificationType,
    ) {
        return this.notificationsService.getUserNotifications(userId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            unreadOnly: unreadOnly === 'true',
            type,
        });
    }

    // ===========================================
    // Get unread count
    // ===========================================
    @Get('unread-count')
    @ApiOperation({ summary: 'O\'qilmagan bildirishnomalar soni' })
    @ApiResponse({ status: 200, description: 'Son' })
    async getUnreadCount(@CurrentUser('id') userId: string) {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { unreadCount: count };
    }

    // ===========================================
    // Mark notification as read
    // ===========================================
    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Bildirishnomani o\'qilgan deb belgilash' })
    @ApiParam({ name: 'id', description: 'Bildirishnoma ID' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli' })
    @ApiResponse({ status: 404, description: 'Bildirishnoma topilmadi' })
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }

    // ===========================================
    // Mark all as read
    // ===========================================
    @Post('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Barcha bildirishnomalarni o\'qilgan deb belgilash' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli' })
    async markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }

    // ===========================================
    // Delete notification
    // ===========================================
    @Delete(':id')
    @ApiOperation({ summary: 'Bildirishnomani o\'chirish' })
    @ApiParam({ name: 'id', description: 'Bildirishnoma ID' })
    @ApiResponse({ status: 200, description: 'Bildirishnoma o\'chirildi' })
    @ApiResponse({ status: 404, description: 'Bildirishnoma topilmadi' })
    async deleteNotification(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.delete(id, userId);
    }

    // ===========================================
    // Delete all notifications
    // ===========================================
    @Delete()
    @ApiOperation({ summary: 'Barcha bildirishnomalarni o\'chirish' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli' })
    async deleteAllNotifications(@CurrentUser('id') userId: string) {
        return this.notificationsService.deleteAll(userId);
    }
}

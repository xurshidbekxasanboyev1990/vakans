// ===========================================
// Chat Controller
// REST API endpoints for chat
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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatRoomDto, SendMessageDto } from './dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    // ===========================================
    // Get my chat rooms
    // ===========================================
    @Get('rooms')
    @ApiOperation({ summary: 'Mening chatlarim' })
    @ApiResponse({ status: 200, description: 'Chatlar ro\'yxati' })
    async getMyRooms(@CurrentUser('id') userId: string) {
        return this.chatService.getUserChatRooms(userId);
    }

    // ===========================================
    // Create or get chat room
    // ===========================================
    @Post('rooms')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Chat yaratish yoki mavjudni olish' })
    @ApiResponse({ status: 200, description: 'Chat ma\'lumotlari' })
    async createOrGetRoom(
        @CurrentUser('id') userId: string,
        @Body() createDto: CreateChatRoomDto,
    ) {
        return this.chatService.getOrCreateRoom(userId, createDto);
    }

    // ===========================================
    // Get room messages
    // ===========================================
    @Get('rooms/:roomId/messages')
    @ApiOperation({ summary: 'Chat xabarlari' })
    @ApiParam({ name: 'roomId', description: 'Chat ID' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Xabarlar ro\'yxati' })
    async getRoomMessages(
        @Param('roomId') roomId: string,
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.chatService.getRoomMessages(roomId, userId, {
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }

    // ===========================================
    // Send message (REST fallback)
    // ===========================================
    @Post('rooms/:roomId/messages')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Xabar yuborish (REST)' })
    @ApiParam({ name: 'roomId', description: 'Chat ID' })
    @ApiResponse({ status: 201, description: 'Xabar yuborildi' })
    async sendMessage(
        @Param('roomId') roomId: string,
        @CurrentUser('id') userId: string,
        @Body() messageDto: SendMessageDto,
    ) {
        return this.chatService.sendMessage(userId, roomId, messageDto);
    }

    // ===========================================
    // Mark messages as read
    // ===========================================
    @Post('rooms/:roomId/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xabarlarni o\'qilgan deb belgilash' })
    @ApiParam({ name: 'roomId', description: 'Chat ID' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli' })
    async markAsRead(
        @Param('roomId') roomId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.chatService.markAsRead(roomId, userId);
    }

    // ===========================================
    // Delete message
    // ===========================================
    @Delete('messages/:messageId')
    @ApiOperation({ summary: 'Xabarni o\'chirish' })
    @ApiParam({ name: 'messageId', description: 'Xabar ID' })
    @ApiResponse({ status: 200, description: 'Xabar o\'chirildi' })
    async deleteMessage(
        @Param('messageId') messageId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.chatService.deleteMessage(messageId, userId);
    }

    // ===========================================
    // Get unread count
    // ===========================================
    @Get('unread-count')
    @ApiOperation({ summary: 'O\'qilmagan xabarlar soni' })
    @ApiResponse({ status: 200, description: 'Son' })
    async getUnreadCount(@CurrentUser('id') userId: string) {
        const count = await this.chatService.getUnreadCount(userId);
        return { unreadCount: count };
    }

    // ===========================================
    // Check if can chat with user
    // ===========================================
    @Get('can-chat/:userId')
    @ApiOperation({ summary: 'Foydalanuvchi bilan chat qilish mumkinmi' })
    @ApiParam({ name: 'userId', description: 'Foydalanuvchi ID' })
    @ApiResponse({ status: 200, description: 'Natija' })
    async canChat(
        @Param('userId') targetUserId: string,
        @CurrentUser('id') userId: string,
    ) {
        const canChat = await this.chatService.canChat(userId, targetUserId);
        return { canChat };
    }
}

// ===========================================
// Users Controller - API Endpoints
// ===========================================
// Handles user HTTP requests
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
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationParams, UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // ===========================================
    // GET ALL USERS (Admin only)
    // ===========================================

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Barcha foydalanuvchilar (Admin)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    @ApiQuery({ name: 'region', required: false, type: String })
    @ApiQuery({ name: 'isVerified', required: false, type: Boolean })
    @ApiQuery({ name: 'isBlocked', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Foydalanuvchilar ro\'yxati' })
    async findAll(@Query() query: PaginationParams) {
        const result = await this.usersService.findAll(query);
        return {
            success: true,
            ...result,
        };
    }

    // ===========================================
    // GET USER BY ID
    // ===========================================

    @Get(':id')
    @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlari' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi topildi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async findById(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        return {
            success: true,
            data: user,
        };
    }

    // ===========================================
    // UPDATE PROFILE
    // ===========================================

    @Put('profile')
    @ApiOperation({ summary: 'Profilni yangilash' })
    @ApiResponse({ status: 200, description: 'Profil yangilandi' })
    @ApiResponse({ status: 400, description: 'Noto\'g\'ri ma\'lumotlar' })
    async updateProfile(
        @CurrentUser() user: User,
        @Body() dto: UpdateProfileDto,
    ) {
        const updatedUser = await this.usersService.updateProfile(user.id, dto);
        return {
            success: true,
            data: updatedUser,
        };
    }

    // ===========================================
    // GET MY STATS
    // ===========================================

    @Get('profile/stats')
    @ApiOperation({ summary: 'Mening statistikam' })
    @ApiResponse({ status: 200, description: 'Statistika' })
    async getMyStats(@CurrentUser() user: User) {
        const stats = await this.usersService.getUserStats(user.id);
        return {
            success: true,
            data: stats,
        };
    }

    // ===========================================
    // VERIFY USER (Admin only)
    // ===========================================

    @Put(':id/verify')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Foydalanuvchini tasdiqlash (Admin)' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi tasdiqlandi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async verifyUser(@Param('id') id: string) {
        const user = await this.usersService.verifyUser(id);
        return {
            success: true,
            data: user,
            message: 'Foydalanuvchi muvaffaqiyatli tasdiqlandi',
        };
    }

    // ===========================================
    // BLOCK/UNBLOCK USER (Admin only)
    // ===========================================

    @Put(':id/toggle-block')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Foydalanuvchini bloklash/blokdan chiqarish (Admin)' })
    @ApiResponse({ status: 200, description: 'Holat o\'zgartirildi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async toggleBlockUser(@Param('id') id: string) {
        const user = await this.usersService.toggleBlockUser(id);
        return {
            success: true,
            data: user,
            message: user.isBlocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi',
        };
    }

    // ===========================================
    // DELETE USER (Admin only)
    // ===========================================

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Foydalanuvchini o\'chirish (Admin)' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi o\'chirildi' })
    @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
    async deleteUser(@Param('id') id: string) {
        await this.usersService.deleteUser(id);
        return {
            success: true,
            message: 'Foydalanuvchi muvaffaqiyatli o\'chirildi',
        };
    }
}

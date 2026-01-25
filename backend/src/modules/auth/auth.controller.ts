// ===========================================
// Auth Controller - API Endpoints
// ===========================================
// Handles authentication HTTP requests
// Author: Vakans.uz Team
// ===========================================

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Cookie options for refresh token
const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ===========================================
    // REGISTER
    // ===========================================

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Ro\'yxatdan o\'tish' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Muvaffaqiyatli ro\'yxatdan o\'tildi' })
    @ApiResponse({ status: 409, description: 'Telefon raqam allaqachon mavjud' })
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.register(dto);

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return {
            success: true,
            data: result.user,
            accessToken: result.accessToken,
        };
    }

    // ===========================================
    // LOGIN
    // ===========================================

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tizimga kirish' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish' })
    @ApiResponse({ status: 401, description: 'Telefon raqam yoki parol noto\'g\'ri' })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return {
            success: true,
            data: result.user,
            accessToken: result.accessToken,
        };
    }

    // ===========================================
    // LOGOUT
    // ===========================================

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Tizimdan chiqish' })
    @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqish' })
    async logout(
        @CurrentUser() user: User,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(user.id, refreshToken);
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken', { path: '/' });

        return {
            success: true,
            message: 'Muvaffaqiyatli chiqildi',
        };
    }

    // ===========================================
    // REFRESH TOKEN
    // ===========================================

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Tokenni yangilash' })
    @ApiResponse({ status: 200, description: 'Token yangilandi' })
    @ApiResponse({ status: 401, description: 'Token yaroqsiz' })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return {
                success: false,
                error: 'Refresh token topilmadi',
            };
        }

        const tokens = await this.authService.refreshToken(refreshToken);

        // Set new refresh token as HttpOnly cookie
        res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

        return {
            success: true,
            accessToken: tokens.accessToken,
        };
    }

    // ===========================================
    // GET CURRENT USER
    // ===========================================

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Joriy foydalanuvchi ma\'lumotlari' })
    @ApiResponse({ status: 200, description: 'Foydalanuvchi ma\'lumotlari' })
    @ApiResponse({ status: 401, description: 'Avtorizatsiya talab qilinadi' })
    async getMe(@CurrentUser() user: User) {
        const currentUser = await this.authService.getCurrentUser(user.id);

        return {
            success: true,
            data: currentUser,
        };
    }

    // ===========================================
    // CHANGE PASSWORD
    // ===========================================

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Parolni o\'zgartirish' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ status: 200, description: 'Parol o\'zgartirildi' })
    @ApiResponse({ status: 400, description: 'Joriy parol noto\'g\'ri' })
    async changePassword(
        @CurrentUser() user: User,
        @Body() dto: ChangePasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);

        // Clear refresh token cookie to force re-login
        res.clearCookie('refreshToken', { path: '/' });

        return {
            success: true,
            message: 'Parol muvaffaqiyatli o\'zgartirildi. Qaytadan kiring.',
        };
    }
}

// ===========================================
// Auth Service - Business Logic
// ===========================================
// Handles authentication operations
// Author: Vakans.uz Team
// ===========================================

import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Token payload interface
export interface TokenPayload {
    sub: string; // User ID
    phone: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Auth response interface
export interface AuthResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly SALT_ROUNDS = 12;
    private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) { }

    // ===========================================
    // REGISTER
    // ===========================================

    async register(dto: RegisterDto): Promise<AuthResponse> {
        // Check if phone already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });

        if (existingUser) {
            throw new ConflictException('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan');
        }

        // Check if email already exists (if provided)
        if (dto.email) {
            const existingEmail = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existingEmail) {
                throw new ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                phone: dto.phone,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role as UserRole,
                email: dto.email,
                region: dto.region,
                companyName: dto.role === 'EMPLOYER' ? dto.companyName : undefined,
            },
        });

        this.logger.log(`New user registered: ${user.phone} (${user.role})`);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    // ===========================================
    // LOGIN
    // ===========================================

    async login(dto: LoginDto): Promise<AuthResponse> {
        // Find user by phone
        const user = await this.prisma.user.findUnique({
            where: { phone: dto.phone },
        });

        if (!user) {
            throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
        }

        // Check if user is blocked
        if (user.isBlocked) {
            throw new UnauthorizedException('Sizning akkauntingiz bloklangan');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
        }

        // Update last active
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        this.logger.log(`User logged in: ${user.phone}`);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            ...tokens,
        };
    }

    // ===========================================
    // LOGOUT
    // ===========================================

    async logout(userId: string, refreshToken: string): Promise<void> {
        // Delete refresh token from database
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                token: refreshToken,
            },
        });

        // Add token to blacklist in Redis
        const tokenKey = `blacklist:${refreshToken}`;
        await this.redisService.set(tokenKey, '1', this.REFRESH_TOKEN_TTL);

        this.logger.log(`User logged out: ${userId}`);
    }

    // ===========================================
    // REFRESH TOKEN
    // ===========================================

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
        // Check if token is blacklisted
        const isBlacklisted = await this.redisService.exists(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
            throw new UnauthorizedException('Token yaroqsiz');
        }

        // Find refresh token in database
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Token topilmadi');
        }

        // Check if token is expired
        if (new Date() > storedToken.expiresAt) {
            // Delete expired token
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            throw new UnauthorizedException('Token muddati tugagan');
        }

        // Check if user is blocked
        if (storedToken.user.isBlocked) {
            throw new UnauthorizedException('Sizning akkauntingiz bloklangan');
        }

        // Delete old refresh token
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        // Generate new tokens
        const tokens = await this.generateTokens(storedToken.user);

        return tokens;
    }

    // ===========================================
    // GET CURRENT USER
    // ===========================================

    async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('Foydalanuvchi topilmadi');
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // ===========================================
    // VALIDATE USER (for LocalStrategy)
    // ===========================================

    async validateUser(phone: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });

        if (!user || user.isBlocked) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // ===========================================
    // CHANGE PASSWORD
    // ===========================================

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('Foydalanuvchi topilmadi');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Joriy parol noto\'g\'ri');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Invalidate all refresh tokens
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        this.logger.log(`Password changed for user: ${userId}`);
    }

    // ===========================================
    // HELPER METHODS
    // ===========================================

    private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const payload: TokenPayload = {
            sub: user.id,
            phone: user.phone,
            role: user.role,
        };

        // Generate access token
        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        });

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Store refresh token in database
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verify JWT token and return payload
     */
    verifyToken(token: string): TokenPayload {
        try {
            return this.jwtService.verify<TokenPayload>(token);
        } catch {
            throw new UnauthorizedException('Token yaroqsiz');
        }
    }
}

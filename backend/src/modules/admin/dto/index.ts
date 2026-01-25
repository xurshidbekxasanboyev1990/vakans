// ===========================================
// Admin DTOs
// Data Transfer Objects for validation
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

// Valid notification types
const VALID_NOTIFICATION_TYPES: string[] = [
    'APPLICATION',
    'APPLICATION_RECEIVED',
    'APPLICATION_ACCEPTED',
    'APPLICATION_REJECTED',
    'MESSAGE',
    'NEW_MESSAGE',
    'JOB_MATCH',
    'JOB_EXPIRED',
    'JOB_APPROVED',
    'REMINDER',
    'SYSTEM',
];

// ===========================================
// Block User DTO
// ===========================================
export class BlockUserDto {
    @ApiPropertyOptional({
        description: 'Bloklash sababi',
        example: 'Platforma qoidalarini buzganligi uchun',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    reason?: string;
}

// ===========================================
// Reject Job DTO
// ===========================================
export class RejectJobDto {
    @ApiProperty({
        description: 'Rad etish sababi',
        example: 'Ish e\'loni qoidalarga mos kelmaydi',
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty({ message: 'Rad etish sababi kiritilishi shart' })
    @MaxLength(500)
    reason: string;
}

// ===========================================
// Broadcast Notification DTO
// ===========================================
export class BroadcastNotificationDto {
    @ApiProperty({
        description: 'Sarlavha',
        example: 'Muhim yangilik!',
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty({ message: 'Sarlavha kiritilishi shart' })
    @MaxLength(200)
    title: string;

    @ApiProperty({
        description: 'Xabar matni',
        example: 'Platformamizda yangi funksiyalar qo\'shildi',
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty({ message: 'Xabar matni kiritilishi shart' })
    @MaxLength(1000)
    message: string;

    @ApiPropertyOptional({
        description: 'Bildirishnoma turi',
        enum: NotificationType,
        default: NotificationType.SYSTEM,
    })
    @Transform(({ value }) => {
        // String kelsa va valid bo'lsa qaytarish, aks holda SYSTEM
        if (typeof value === 'string' && VALID_NOTIFICATION_TYPES.includes(value)) {
            return value as NotificationType;
        }
        return 'SYSTEM' as NotificationType;
    })
    @IsOptional()
    @IsString()
    type?: NotificationType;

    @ApiPropertyOptional({
        description: 'Havola',
        example: '/news/important-update',
    })
    @IsString()
    @IsOptional()
    link?: string;
}

// ===========================================
// Update User DTO (Admin)
// ===========================================
export class AdminUpdateUserDto {
    @ApiPropertyOptional({
        description: 'Ism',
        example: 'Ali',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    firstName?: string;

    @ApiPropertyOptional({
        description: 'Familiya',
        example: 'Valiyev',
        maxLength: 100,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    lastName?: string;

    @ApiPropertyOptional({
        description: 'Email',
        example: 'ali@example.com',
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Telefon raqami',
        example: '+998901234567',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Yangi parol',
        example: 'NewPassword123',
        minLength: 6,
    })
    @IsString()
    @IsOptional()
    @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
    password?: string;

    @ApiPropertyOptional({
        description: 'Rol',
        enum: UserRole,
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiPropertyOptional({
        description: 'Hudud',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'Tasdiqlangan',
    })
    @IsBoolean()
    @IsOptional()
    isVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Bloklangan',
    })
    @IsBoolean()
    @IsOptional()
    isBlocked?: boolean;
}

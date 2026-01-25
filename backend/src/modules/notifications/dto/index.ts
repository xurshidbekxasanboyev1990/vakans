// ===========================================
// Notification DTOs
// Data Transfer Objects for validation
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';

// ===========================================
// Create Notification DTO (Admin)
// ===========================================
export class CreateNotificationDto {
    @ApiProperty({
        description: 'Foydalanuvchi ID',
        example: 'clx123abc...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Foydalanuvchi ID kiritilishi shart' })
    userId: string;

    @ApiProperty({
        description: 'Bildirishnoma turi',
        enum: NotificationType,
    })
    @Transform(({ value }) => {
        if (typeof value === 'string' && Object.values(NotificationType).includes(value as NotificationType)) {
            return value as NotificationType;
        }
        return value;
    })
    @IsEnum(NotificationType, {
        message: 'Bildirishnoma turi noto\'g\'ri',
    })
    @IsNotEmpty()
    type: NotificationType;

    @ApiProperty({
        description: 'Sarlavha',
        example: 'Yangi ariza',
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty({ message: 'Sarlavha kiritilishi shart' })
    @MaxLength(200)
    title: string;

    @ApiProperty({
        description: 'Xabar matni',
        example: 'Sizga yangi ariza keldi',
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty({ message: 'Xabar matni kiritilishi shart' })
    @MaxLength(1000)
    message: string;

    @ApiPropertyOptional({
        description: 'Qo\'shimcha ma\'lumotlar',
        example: { applicationId: 'abc123' },
    })
    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Havola',
        example: '/applications/abc123',
    })
    @IsString()
    @IsOptional()
    link?: string;
}

// ===========================================
// Notification Filter DTO
// ===========================================
export class NotificationFilterDto {
    @ApiPropertyOptional({
        description: 'Sahifa raqami',
        default: 1,
        minimum: 1,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    page?: number;

    @ApiPropertyOptional({
        description: 'Sahifadagi elementlar soni',
        default: 20,
        minimum: 1,
        maximum: 100,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    limit?: number;

    @ApiPropertyOptional({
        description: 'Faqat o\'qilmagan',
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    unreadOnly?: boolean;

    @ApiPropertyOptional({
        description: 'Bildirishnoma turi',
        enum: NotificationType,
    })
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;
}

// ===========================================
// Broadcast Notification DTO (Admin)
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
    @IsEnum(NotificationType)
    @IsOptional()
    type?: NotificationType;

    @ApiPropertyOptional({
        description: 'Havola',
        example: '/news/important-update',
    })
    @IsString()
    @IsOptional()
    link?: string;
}

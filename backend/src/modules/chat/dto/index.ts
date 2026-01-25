// ===========================================
// Chat DTOs
// Data Transfer Objects for validation
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';

// ===========================================
// Create Chat Room DTO
// ===========================================
export class CreateChatRoomDto {
    @ApiProperty({
        description: 'Suhbatdosh foydalanuvchi ID',
        example: 'clx123abc...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Foydalanuvchi ID kiritilishi shart' })
    participantId: string;

    @ApiPropertyOptional({
        description: 'Ish ID (ixtiyoriy, agar muayyan ish haqida chat ochilsa)',
        example: 'clx456def...',
    })
    @IsString()
    @IsOptional()
    jobId?: string;
}

// ===========================================
// Send Message DTO
// ===========================================
export class SendMessageDto {
    @ApiPropertyOptional({
        description: 'Xabar matni',
        example: 'Salom! Ishingiz qiziqarli ko\'rinadi.',
        maxLength: 2000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(2000, { message: 'Xabar 2000 belgidan oshmasligi kerak' })
    content?: string;

    @ApiPropertyOptional({
        description: 'Xabar turi',
        enum: MessageType,
        default: MessageType.TEXT,
    })
    @IsEnum(MessageType)
    @IsOptional()
    type?: MessageType;

    @ApiPropertyOptional({
        description: 'Fayl URL (rasm yoki fayl uchun)',
        example: 'https://storage.vakans.uz/files/document.pdf',
    })
    @IsUrl({}, { message: 'Noto\'g\'ri URL formati' })
    @IsOptional()
    fileUrl?: string;

    @ApiPropertyOptional({
        description: 'Fayl nomi',
        example: 'rezyume.pdf',
    })
    @IsString()
    @IsOptional()
    fileName?: string;

    @ApiPropertyOptional({
        description: 'Fayl hajmi (bayt)',
        example: 1024000,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    fileSize?: number;
}

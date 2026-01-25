// ===========================================
// Application DTOs
// Data Transfer Objects for validation
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';

// ===========================================
// Create Application DTO
// ===========================================
export class CreateApplicationDto {
    @ApiProperty({
        description: 'Ish ID',
        example: 'clx123abc...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Ish ID kiritilishi shart' })
    jobId: string;

    @ApiPropertyOptional({
        description: 'Qo\'shimcha xat',
        example: 'Men bu lavozimga juda mos kelamanman chunki...',
        maxLength: 2000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(2000, { message: 'Qo\'shimcha xat 2000 belgidan oshmasligi kerak' })
    coverLetter?: string;

    @ApiPropertyOptional({
        description: 'Rezyume fayl URL',
        example: 'https://storage.vakans.uz/resumes/my-resume.pdf',
    })
    @IsUrl({}, { message: 'Noto\'g\'ri URL formati' })
    @IsOptional()
    resumeUrl?: string;
}

// ===========================================
// Update Application Status DTO
// ===========================================
export class UpdateApplicationStatusDto {
    @ApiProperty({
        description: 'Yangi holat',
        enum: ApplicationStatus,
        example: ApplicationStatus.VIEWED,
    })
    @IsEnum(ApplicationStatus, { message: 'Noto\'g\'ri holat' })
    @IsNotEmpty({ message: 'Holat kiritilishi shart' })
    status: ApplicationStatus;

    @ApiPropertyOptional({
        description: 'Ish beruvchi qaydlari (faqat ish beruvchiga ko\'rinadi)',
        example: 'Yaxshi nomzod, intervyuga chaqirish kerak',
        maxLength: 1000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Qaydlar 1000 belgidan oshmasligi kerak' })
    employerNotes?: string;

    @ApiPropertyOptional({
        description: 'Rad etish sababi (faqat REJECTED holati uchun)',
        example: 'Tajriba yetarli emas',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500, { message: 'Rad etish sababi 500 belgidan oshmasligi kerak' })
    rejectionReason?: string;
}

// ===========================================
// Create Job DTO - Data Transfer Object
// ===========================================
// Validates job creation request data
// Author: Vakans.uz Team
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalaryType, WorkType } from '@prisma/client';
import {
    IsArray,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    Max,
    Min,
} from 'class-validator';

export class CreateJobDto {
    @ApiProperty({
        description: 'Ish nomi',
        example: 'Frontend Developer',
    })
    @IsString()
    @IsNotEmpty({ message: 'Ish nomi kiritilishi shart' })
    title: string;

    @ApiProperty({
        description: 'Ish tavsifi',
        example: 'React, TypeScript bilimi kerak...',
    })
    @IsString()
    @IsNotEmpty({ message: 'Ish tavsifi kiritilishi shart' })
    description: string;

    @ApiPropertyOptional({
        description: 'Kategoriya ID',
        example: 'clx123abc',
    })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({
        description: 'Talablar ro\'yxati',
        example: ['React', 'TypeScript', '2 yil tajriba'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    requirements?: string[];

    @ApiPropertyOptional({
        description: 'Imtiyozlar ro\'yxati',
        example: ['Remote ishlash', 'Flexible hours'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    benefits?: string[];

    @ApiPropertyOptional({
        description: 'Minimal maosh',
        example: 5000000,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    @Max(2000000000, { message: 'Maosh 2 milliarddan oshmasligi kerak' })
    @IsOptional()
    salaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maksimal maosh',
        example: 10000000,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    @Max(2000000000, { message: 'Maosh 2 milliarddan oshmasligi kerak' })
    @IsOptional()
    salaryMax?: number;

    @ApiPropertyOptional({
        description: 'Maosh turi',
        enum: ['HOURLY', 'DAILY', 'MONTHLY', 'FIXED', 'NEGOTIABLE'],
        example: 'MONTHLY',
    })
    @IsEnum(SalaryType)
    @IsOptional()
    salaryType?: SalaryType;

    @ApiPropertyOptional({
        description: 'Valyuta',
        example: 'UZS',
        default: 'UZS',
    })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({
        description: 'Joylashuv (shahar)',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({
        description: 'Viloyat',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'To\'liq manzil',
        example: 'Chilonzor tumani, IT Park',
    })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({
        description: 'Ish turi',
        enum: ['FULL_TIME', 'PART_TIME', 'REMOTE', 'CONTRACT', 'TEMPORARY'],
        example: 'FULL_TIME',
    })
    @IsEnum(WorkType)
    @IsNotEmpty({ message: 'Ish turi kiritilishi shart' })
    workType: WorkType;

    @ApiPropertyOptional({
        description: 'Talab qilinadigan tajriba',
        example: '2-3 yil',
    })
    @IsString()
    @IsOptional()
    experienceRequired?: string;

    @ApiPropertyOptional({
        description: 'Talab qilinadigan ta\'lim',
        example: 'Oliy ma\'lumot',
    })
    @IsString()
    @IsOptional()
    educationRequired?: string;

    @ApiPropertyOptional({
        description: 'Talab qilinadigan tillar',
        example: ['O\'zbek', 'Ingliz'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languagesRequired?: string[];

    @ApiPropertyOptional({
        description: 'Aloqa telefon raqami',
        example: '+998901234567',
    })
    @IsString()
    @Matches(/^\+998\d{9}$/, { message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' })
    @IsOptional()
    contactPhone?: string;

    @ApiPropertyOptional({
        description: 'Aloqa email',
        example: 'hr@company.uz',
    })
    @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
    @IsOptional()
    contactEmail?: string;

    @ApiPropertyOptional({
        description: 'Ariza berish muddati (ISO format)',
        example: '2024-12-31T23:59:59Z',
    })
    @IsDateString()
    @IsOptional()
    deadline?: string;

    @ApiPropertyOptional({
        description: 'E\'lon muddati (ISO format)',
        example: '2024-12-31T23:59:59Z',
    })
    @IsDateString()
    @IsOptional()
    expiresAt?: string;
}

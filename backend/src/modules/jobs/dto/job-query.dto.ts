// ===========================================
// Job Query DTO
// Query parameters for job filtering
// ===========================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus, WorkType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class JobQueryDto {
    @ApiPropertyOptional({
        description: 'Sahifa raqami',
        default: 1,
        minimum: 1,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10) || 1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Sahifadagi elementlar soni',
        default: 12,
        minimum: 1,
        maximum: 100,
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10) || 12)
    limit?: number = 12;

    @ApiPropertyOptional({
        description: 'Qidiruv so\'zi',
        example: 'developer',
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        description: 'Kategoriya ID',
        example: 'clx123abc...',
    })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({
        description: 'Hudud',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'Ish turi',
        enum: WorkType,
    })
    @IsEnum(WorkType)
    @IsOptional()
    workType?: WorkType;

    @ApiPropertyOptional({
        description: 'Minimal maosh',
        example: 1000000,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    salaryMin?: number;

    @ApiPropertyOptional({
        description: 'Maksimal maosh',
        example: 5000000,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    salaryMax?: number;

    @ApiPropertyOptional({
        description: 'Status',
        enum: JobStatus,
    })
    @IsEnum(JobStatus)
    @IsOptional()
    status?: JobStatus;

    @ApiPropertyOptional({
        description: 'Ish beruvchi ID',
        example: 'clx123abc...',
    })
    @IsString()
    @IsOptional()
    employerId?: string;

    @ApiPropertyOptional({
        description: 'Featured e\'lonlar',
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isFeatured?: boolean;

    @ApiPropertyOptional({
        description: 'Shoshilinch e\'lonlar',
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isUrgent?: boolean;
}

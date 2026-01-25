// ===========================================
// Update Job DTO - Data Transfer Object
// ===========================================
// Validates job update request data
// Author: Vakans.uz Team
// ===========================================

import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(CreateJobDto) {
    @ApiPropertyOptional({
        description: 'Featured e\'lon',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        description: 'Urgent e\'lon',
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    isUrgent?: boolean;

    @ApiPropertyOptional({
        description: 'E\'lon statusi (Admin only)',
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'CLOSED', 'EXPIRED'],
        example: 'ACTIVE',
    })
    @IsEnum(JobStatus)
    @IsOptional()
    status?: JobStatus;
}

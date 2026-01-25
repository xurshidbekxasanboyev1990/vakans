// ===========================================
// Update Job Status DTO - Data Transfer Object
// ===========================================
// Validates job status update request
// Author: Vakans.uz Team
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateJobStatusDto {
    @ApiProperty({
        description: 'Yangi status',
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'CLOSED', 'EXPIRED'],
        example: 'ACTIVE',
    })
    @IsEnum(JobStatus)
    status: JobStatus;

    @ApiPropertyOptional({
        description: 'Rad etish sababi (REJECTED uchun)',
        example: 'Ma\'lumotlar to\'liq emas',
    })
    @IsString()
    @IsOptional()
    rejectionReason?: string;
}

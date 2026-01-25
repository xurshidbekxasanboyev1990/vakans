// ===========================================
// Update Profile DTO - Data Transfer Object
// ===========================================
// Validates profile update request data
// Author: Vakans.uz Team
// ===========================================

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
} from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'Ism',
        example: 'Aziz',
    })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({
        description: 'Familiya',
        example: 'Karimov',
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional({
        description: 'Email',
        example: 'aziz@example.com',
    })
    @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Bio - qisqacha ma\'lumot',
        example: 'Tajribali frontend dasturchi',
    })
    @IsString()
    @IsOptional()
    bio?: string;

    @ApiPropertyOptional({
        description: 'Viloyat',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'Manzil',
        example: 'Chilonzor tumani',
    })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({
        description: 'Avatar URL',
        example: 'https://example.com/avatar.jpg',
    })
    @IsString({ message: 'Avatar URL string bo\'lishi kerak' })
    @IsOptional()
    avatar?: string;

    // ===========================================
    // WORKER FIELDS
    // ===========================================

    @ApiPropertyOptional({
        description: 'Ko\'nikmalar ro\'yxati (Worker)',
        example: ['React', 'TypeScript', 'Node.js'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[];

    @ApiPropertyOptional({
        description: 'Tajriba yillari (Worker)',
        example: 3,
        minimum: 0,
        maximum: 50,
    })
    @IsNumber()
    @Min(0)
    @Max(50)
    @IsOptional()
    experienceYears?: number;

    @ApiPropertyOptional({
        description: 'Ta\'lim (Worker)',
        example: 'Oliy - Bakalavr',
    })
    @IsString()
    @IsOptional()
    education?: string;

    @ApiPropertyOptional({
        description: 'Tillar (Worker)',
        example: ['O\'zbek', 'Rus', 'Ingliz'],
        type: [String],
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    languages?: string[];

    @ApiPropertyOptional({
        description: 'Resume URL (Worker)',
        example: 'https://example.com/resume.pdf',
    })
    @IsUrl({}, { message: 'Resume URL formati noto\'g\'ri' })
    @IsOptional()
    resumeUrl?: string;

    // ===========================================
    // EMPLOYER FIELDS
    // ===========================================

    @ApiPropertyOptional({
        description: 'Kompaniya nomi (Employer)',
        example: 'Tech Solutions',
    })
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiPropertyOptional({
        description: 'Kompaniya haqida (Employer)',
        example: 'Dasturiy ta\'minot ishlab chiqaruvchi kompaniya',
    })
    @IsString()
    @IsOptional()
    companyDescription?: string;

    @ApiPropertyOptional({
        description: 'Kompaniya logotipi URL (Employer)',
        example: 'https://example.com/logo.png',
    })
    @IsUrl({}, { message: 'Logo URL formati noto\'g\'ri' })
    @IsOptional()
    companyLogo?: string;

    @ApiPropertyOptional({
        description: 'Veb-sayt (Employer)',
        example: 'https://techsolutions.uz',
    })
    @IsUrl({}, { message: 'Veb-sayt URL formati noto\'g\'ri' })
    @IsOptional()
    website?: string;
}

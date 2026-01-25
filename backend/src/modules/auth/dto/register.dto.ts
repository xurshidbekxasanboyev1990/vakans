// ===========================================
// Register DTO - Data Transfer Object
// ===========================================
// Validates registration request data
// Author: Vakans.uz Team
// ===========================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'Telefon raqam (+998XXXXXXXXX formatida)',
        example: '+998901234567',
    })
    @IsString()
    @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
    @Matches(/^\+998\d{9}$/, { message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' })
    phone: string;

    @ApiProperty({
        description: 'Parol (kamida 6 ta belgi)',
        example: 'Password123',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: 'Parol kiritilishi shart' })
    @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
    password: string;

    @ApiProperty({
        description: 'Ism',
        example: 'Aziz',
    })
    @IsString()
    @IsNotEmpty({ message: 'Ism kiritilishi shart' })
    firstName: string;

    @ApiPropertyOptional({
        description: 'Familiya',
        example: 'Karimov',
    })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({
        description: 'Foydalanuvchi roli',
        enum: ['WORKER', 'EMPLOYER'],
        example: 'WORKER',
    })
    @IsEnum(['WORKER', 'EMPLOYER'], { message: 'Rol WORKER yoki EMPLOYER bo\'lishi kerak' })
    @IsNotEmpty({ message: 'Rol kiritilishi shart' })
    role: 'WORKER' | 'EMPLOYER';

    @ApiPropertyOptional({
        description: 'Email (ixtiyoriy)',
        example: 'aziz@example.com',
    })
    @IsEmail({}, { message: 'Email formati noto\'g\'ri' })
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({
        description: 'Viloyat',
        example: 'Toshkent',
    })
    @IsString()
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'Kompaniya nomi (Employer uchun)',
        example: 'Tech Solutions',
    })
    @IsString()
    @IsOptional()
    companyName?: string;
}

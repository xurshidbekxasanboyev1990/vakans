// ===========================================
// Login DTO - Data Transfer Object
// ===========================================
// Validates login request data
// Author: Vakans.uz Team
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Telefon raqam (+998XXXXXXXXX formatida)',
        example: '+998901234567',
    })
    @IsString()
    @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
    @Matches(/^\+998\d{9}$/, { message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak' })
    phone: string;

    @ApiProperty({
        description: 'Parol',
        example: 'Password123',
    })
    @IsString()
    @IsNotEmpty({ message: 'Parol kiritilishi shart' })
    @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
    password: string;
}

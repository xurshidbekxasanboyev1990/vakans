// ===========================================
// Change Password DTO - Data Transfer Object
// ===========================================
// Validates password change request data
// Author: Vakans.uz Team
// ===========================================

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Joriy parol',
        example: 'OldPassword123',
    })
    @IsString()
    @IsNotEmpty({ message: 'Joriy parol kiritilishi shart' })
    currentPassword: string;

    @ApiProperty({
        description: 'Yangi parol (kamida 6 ta belgi)',
        example: 'NewPassword123',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: 'Yangi parol kiritilishi shart' })
    @MinLength(6, { message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
    newPassword: string;
}

// ===========================================
// Category DTOs
// ===========================================

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ example: 'IT va Dasturlash' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'IT va Dasturlash' })
    @IsString()
    @IsOptional()
    nameUz?: string;

    @ApiPropertyOptional({ example: 'IT и Программирование' })
    @IsString()
    @IsOptional()
    nameRu?: string;

    @ApiPropertyOptional({ example: 'IT & Programming' })
    @IsString()
    @IsOptional()
    nameEn?: string;

    @ApiProperty({ example: 'it-dasturlash' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiPropertyOptional({ example: '💻' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({ example: '#3B82F6' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

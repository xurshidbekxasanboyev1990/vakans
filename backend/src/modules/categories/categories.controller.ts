// ===========================================
// Categories Controller
// ===========================================

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Barcha kategoriyalar (Public)' })
    @ApiResponse({ status: 200, description: 'Kategoriyalar ro\'yxati' })
    async findAll() {
        const categories = await this.categoriesService.findAll();
        return {
            success: true,
            data: categories,
        };
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Kategoriya ma\'lumotlari (Public)' })
    @ApiResponse({ status: 200, description: 'Kategoriya topildi' })
    @ApiResponse({ status: 404, description: 'Kategoriya topilmadi' })
    async findById(@Param('id') id: string) {
        const category = await this.categoriesService.findById(id);
        return {
            success: true,
            data: category,
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Yangi kategoriya (Admin)' })
    @ApiResponse({ status: 201, description: 'Kategoriya yaratildi' })
    async create(@Body() dto: CreateCategoryDto) {
        const category = await this.categoriesService.create(dto);
        return {
            success: true,
            data: category,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Kategoriyani yangilash (Admin)' })
    @ApiResponse({ status: 200, description: 'Kategoriya yangilandi' })
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        const category = await this.categoriesService.update(id, dto);
        return {
            success: true,
            data: category,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Kategoriyani o\'chirish (Admin)' })
    @ApiResponse({ status: 200, description: 'Kategoriya o\'chirildi' })
    async delete(@Param('id') id: string) {
        await this.categoriesService.delete(id);
        return {
            success: true,
            message: 'Kategoriya o\'chirildi',
        };
    }
}

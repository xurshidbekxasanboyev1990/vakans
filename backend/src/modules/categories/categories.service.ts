// ===========================================
// Categories Service
// ===========================================

import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);
    private readonly CACHE_KEY = 'categories:all';
    private readonly CACHE_TTL = 3600; // 1 hour

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async findAll() {
        // Try cache first
        const cached = await this.redisService.getJson<any[]>(this.CACHE_KEY);
        if (cached) {
            return cached;
        }

        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: {
                        jobs: { where: { status: 'ACTIVE' } },
                    },
                },
            },
        });

        const result = categories.map((c) => ({
            id: c.id,
            name: c.name,
            nameUz: c.nameUz,
            nameRu: c.nameRu,
            nameEn: c.nameEn,
            slug: c.slug,
            icon: c.icon,
            color: c.color,
            jobCount: c._count.jobs,
            jobsCount: c._count.jobs,
            isActive: c.isActive,
        }));

        // Cache result
        await this.redisService.setJson(this.CACHE_KEY, result, this.CACHE_TTL);

        return result;
    }

    async findById(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        jobs: { where: { status: 'ACTIVE' } },
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Kategoriya topilmadi');
        }

        return {
            ...category,
            jobCount: category._count.jobs,
        };
    }

    async create(dto: CreateCategoryDto) {
        // Check if slug already exists
        const existing = await this.prisma.category.findUnique({
            where: { slug: dto.slug },
        });

        if (existing) {
            throw new ConflictException('Bu slug allaqachon mavjud');
        }

        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                nameUz: dto.nameUz,
                nameRu: dto.nameRu,
                nameEn: dto.nameEn,
                slug: dto.slug,
                icon: dto.icon,
                color: dto.color,
                sortOrder: dto.sortOrder || 0,
            },
        });

        // Invalidate cache
        await this.redisService.del(this.CACHE_KEY);

        this.logger.log(`Category created: ${category.id}`);

        return category;
    }

    async update(id: string, dto: UpdateCategoryDto) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Kategoriya topilmadi');
        }

        // Check slug uniqueness if changing
        if (dto.slug && dto.slug !== category.slug) {
            const existing = await this.prisma.category.findUnique({
                where: { slug: dto.slug },
            });
            if (existing) {
                throw new ConflictException('Bu slug allaqachon mavjud');
            }
        }

        const updated = await this.prisma.category.update({
            where: { id },
            data: dto,
        });

        // Invalidate cache
        await this.redisService.del(this.CACHE_KEY);

        this.logger.log(`Category updated: ${id}`);

        return updated;
    }

    async delete(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Kategoriya topilmadi');
        }

        await this.prisma.category.delete({
            where: { id },
        });

        // Invalidate cache
        await this.redisService.del(this.CACHE_KEY);

        this.logger.log(`Category deleted: ${id}`);
    }
}

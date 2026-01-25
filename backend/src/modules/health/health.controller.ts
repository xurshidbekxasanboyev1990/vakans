// ===========================================
// Health Controller
// API health check endpoints
// ===========================================

import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/redis/redis.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    // ===========================================
    // Basic health check
    // ===========================================
    @Get()
    @Public()
    @ApiOperation({ summary: 'API health check' })
    @ApiResponse({ status: 200, description: 'API is healthy' })
    async check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }

    // ===========================================
    // Detailed health check
    // ===========================================
    @Get('detailed')
    @Public()
    @ApiOperation({ summary: 'Detailed health check' })
    @ApiResponse({ status: 200, description: 'Detailed health information' })
    async detailedCheck() {
        const checks = {
            api: { status: 'ok' },
            database: { status: 'unknown' },
            redis: { status: 'unknown' },
        };

        // Check database
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            checks.database = { status: 'ok' };
        } catch (error: any) {
            checks.database = { status: 'error', message: error?.message || 'Database error' } as any;
        }

        // Check Redis
        try {
            await this.redis.set('health:ping', 'pong', 10);
            await this.redis.get('health:ping');
            checks.redis = { status: 'ok' };
        } catch (error: any) {
            checks.redis = { status: 'error', message: error?.message || 'Redis error' } as any;
        }

        const allHealthy = Object.values(checks).every((c) => c.status === 'ok');

        return {
            status: allHealthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            checks,
        };
    }
}

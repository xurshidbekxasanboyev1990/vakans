// ===========================================
// Vakans.uz Backend - Root Application Module
// ===========================================
// Central module that imports all feature modules
// Author: Vakans.uz Team
// ===========================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';

// Shared Modules
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';

// Feature Modules
import { AdminModule } from './modules/admin/admin.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ChatModule } from './modules/chat/chat.module';
import { HealthModule } from './modules/health/health.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';

// Configuration
import configuration from './config/configuration';

@Module({
    imports: [
        // ===========================================
        // Configuration Module
        // Load environment variables globally
        // ===========================================
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: ['.env', '.env.local'],
        }),

        // ===========================================
        // Static File Serving (Uploads)
        // ===========================================
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),

        // ===========================================
        // Rate Limiting (Throttler)
        // Protect against brute force attacks
        // ===========================================
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ([{
                ttl: config.get<number>('THROTTLE_TTL', 60000),
                limit: config.get<number>('THROTTLE_LIMIT', 100),
            }]),
        }),

        // ===========================================
        // Database & Cache
        // ===========================================
        PrismaModule,
        RedisModule,

        // ===========================================
        // Feature Modules
        // ===========================================
        AuthModule,
        UsersModule,
        JobsModule,
        CategoriesModule,
        ApplicationsModule,
        ChatModule,
        NotificationsModule,
        AdminModule,
        HealthModule,
        UploadModule,
        ReportsModule,
    ],
    providers: [
        // Global rate limiting guard
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }

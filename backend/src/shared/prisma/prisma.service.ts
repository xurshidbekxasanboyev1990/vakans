// ===========================================
// Prisma Service - Database Client
// ===========================================
// Handles database connection lifecycle
// Author: Vakans.uz Team
// ===========================================

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'info' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
            errorFormat: 'colorless',
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connection established');
        } catch (error) {
            this.logger.error('❌ Failed to connect to database', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🔌 Database connection closed');
    }

    /**
     * Clean database for testing
     * WARNING: Only use in test environment!
     */
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production!');
        }

        const models = Reflect.ownKeys(this).filter(
            (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
        );

        return Promise.all(
            models.map((modelKey) => {
                const model = this[modelKey as keyof this];
                if (model && typeof model === 'object' && 'deleteMany' in model) {
                    return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
                }
                return Promise.resolve();
            }),
        );
    }
}

// ===========================================
// Redis Module - Cache & Session Store
// ===========================================
// Provides Redis client globally
// Author: Vakans.uz Team
// ===========================================

import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule { }

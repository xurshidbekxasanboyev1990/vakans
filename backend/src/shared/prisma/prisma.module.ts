// ===========================================
// Prisma Module - Database Connection
// ===========================================
// Provides PrismaService globally
// Author: Vakans.uz Team
// ===========================================

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }

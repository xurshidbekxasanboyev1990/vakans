// ===========================================
// Jobs Module - Job Management
// ===========================================
// Handles job CRUD operations
// Author: Vakans.uz Team
// ===========================================

import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }

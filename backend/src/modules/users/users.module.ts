// ===========================================
// Users Module - User Management
// ===========================================
// Handles user CRUD operations and profile management
// Author: Vakans.uz Team
// ===========================================

import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }

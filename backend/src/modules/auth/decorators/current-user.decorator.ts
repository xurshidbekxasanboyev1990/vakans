// ===========================================
// Current User Decorator - Get Authenticated User
// ===========================================
// Extracts user from request object
// Author: Vakans.uz Team
// ===========================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Parameter decorator to get current authenticated user
 * Usage: @CurrentUser() user: User
 * Usage: @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
    (data: keyof User | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // If data is provided, return specific property
        if (data && user) {
            return user[data];
        }

        return user;
    },
);

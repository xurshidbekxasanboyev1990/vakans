// ===========================================
// JWT Auth Guard - Protect Routes
// ===========================================
// Requires valid JWT token for access
// Author: Vakans.uz Team
// ===========================================

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    /**
     * Check if route is public or requires authentication
     */
    canActivate(context: ExecutionContext) {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Allow access to public routes
        if (isPublic) {
            return true;
        }

        // Validate JWT token
        return super.canActivate(context);
    }
}

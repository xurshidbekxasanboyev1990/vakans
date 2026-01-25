// ===========================================
// Roles Guard - Role-Based Access Control
// ===========================================
// Restricts access based on user roles
// Author: Vakans.uz Team
// ===========================================

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get required roles from decorator
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No roles required - allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        // Get user from request (attached by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('Avtorizatsiya talab qilinadi');
        }

        // Check if user has required role
        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException('Bu amalni bajarish uchun ruxsat yo\'q');
        }

        return true;
    }
}

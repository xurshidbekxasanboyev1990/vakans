// ===========================================
// Roles Decorator - Define Required Roles
// ===========================================
// Marks routes with required user roles
// Author: Vakans.uz Team
// ===========================================

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * Usage: @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

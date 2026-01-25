// ===========================================
// Optional JWT Auth Guard - Soft Authentication
// ===========================================
// Allows both authenticated and unauthenticated access
// If token provided, validates and attaches user to request
// Author: Vakans.uz Team
// ===========================================

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    /**
     * Always allow access, but try to authenticate if token provided
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            // Try to authenticate
            await super.canActivate(context);
        } catch {
            // Ignore authentication errors - allow unauthenticated access
        }
        return true;
    }

    /**
     * Don't throw error if authentication fails
     */
    handleRequest(err: any, user: any) {
        // Return user if authenticated, null otherwise
        return user || null;
    }
}

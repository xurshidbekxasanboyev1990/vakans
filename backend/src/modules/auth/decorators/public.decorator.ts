// ===========================================
// Public Decorator - Mark Routes as Public
// ===========================================
// Bypasses JWT authentication for marked routes
// Author: Vakans.uz Team
// ===========================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark routes as public (no auth required)
 * Usage: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

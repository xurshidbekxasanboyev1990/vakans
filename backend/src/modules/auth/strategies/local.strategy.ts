// ===========================================
// Local Strategy - Passport Local Authentication
// ===========================================
// Validates username/password for login
// Author: Vakans.uz Team
// ===========================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'phone', // Use phone instead of username
            passwordField: 'password',
        });
    }

    /**
     * Validate user credentials
     * Called by Passport during local authentication
     */
    async validate(phone: string, password: string) {
        const user = await this.authService.validateUser(phone, password);

        if (!user) {
            throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
        }

        return user;
    }
}

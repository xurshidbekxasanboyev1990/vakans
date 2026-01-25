// ===========================================
// JWT Strategy - Passport JWT Authentication
// ===========================================
// Validates JWT tokens and attaches user to request
// Author: Vakans.uz Team
// ===========================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { TokenPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * Validate JWT payload and return user
     * This method is called by Passport after token verification
     */
    async validate(payload: TokenPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
                email: true,
                region: true,
                companyName: true,
                isVerified: true,
                isBlocked: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Foydalanuvchi topilmadi');
        }

        if (user.isBlocked) {
            throw new UnauthorizedException('Sizning akkauntingiz bloklangan');
        }

        return user;
    }
}

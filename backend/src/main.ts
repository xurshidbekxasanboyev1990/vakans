// ===========================================
// Vakans.uz Backend - Main Entry Point
// ===========================================
// NestJS application bootstrap with all configurations
// Author: Vakans.uz Team
// ===========================================

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

// BigInt serialization fix for JSON.stringify
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

async function bootstrap() {
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get config service
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 5000);
    const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');

    // ===========================================
    // Security Middleware
    // ===========================================

    // Helmet for security headers
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // Disable for development
    }));

    // Cookie parser for JWT refresh tokens
    app.use(cookieParser());

    // ===========================================
    // CORS Configuration
    // ===========================================
    app.enableCors({
        origin: corsOrigin.split(','),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // ===========================================
    // API Versioning
    // ===========================================
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // ===========================================
    // Global Validation Pipe
    // ===========================================
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip unknown properties
            forbidNonWhitelisted: true, // Throw error for unknown properties
            transform: true, // Auto-transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true, // Convert types automatically
            },
        }),
    );

    // ===========================================
    // Socket.io Adapter for Real-time
    // ===========================================
    app.useWebSocketAdapter(new IoAdapter(app));

    // ===========================================
    // Swagger API Documentation
    // ===========================================
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Vakans.uz API')
        .setDescription(`
      ## O'zbekiston Ish Qidirish Platformasi API
      
      ### Autentifikatsiya
      - JWT Bearer token ishlatiladi
      - Access token: 15 daqiqa
      - Refresh token: 7 kun (HttpOnly cookie)
      
      ### Rate Limiting
      - 100 so'rov / daqiqada
      
      ### Real-time
      - Socket.io orqali jonli yangilanishlar
      - Namespace: /notifications, /chat
    `)
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addTag('Auth', 'Autentifikatsiya: login, register, logout')
        .addTag('Users', 'Foydalanuvchilar boshqaruvi')
        .addTag('Jobs', 'Ish e\'lonlari')
        .addTag('Categories', 'Ish kategoriyalari')
        .addTag('Applications', 'Ish arizalari')
        .addTag('Chat', 'Xabar almashish')
        .addTag('Notifications', 'Bildirishnomalar')
        .addTag('Admin', 'Admin panel')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
        customSiteTitle: 'Vakans.uz API Docs',
    });

    // ===========================================
    // Start Server
    // ===========================================
    await app.listen(port, '0.0.0.0');

    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Vakans.uz Backend Server                             ║
  ║                                                           ║
  ║   📍 Server:    https://vakans.uz                         ║
  ║   📚 API Docs:  https://vakans.uz/api/docs                ║
  ║   🔌 Socket.io: wss://vakans.uz                           ║
  ║   📍 IP:        77.237.239.235:${port}                     ║
  ║                                                           ║
  ║   Environment: ${configService.get('NODE_ENV', 'development')}                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();

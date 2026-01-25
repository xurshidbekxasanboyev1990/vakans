// ===========================================
// Vakans.uz Backend - Configuration
// ===========================================
// Centralized configuration from environment variables
// Author: Vakans.uz Team
// ===========================================

export default () => ({
    // Application
    app: {
        name: process.env.APP_NAME || 'Vakans.uz',
        version: process.env.APP_VERSION || '1.0.0',
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '5000', 10),
    },

    // Database - PostgreSQL
    database: {
        url: process.env.DATABASE_URL,
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },

    // JWT Authentication
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },

    // Rate Limiting
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    },

    // File Upload
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
        path: process.env.UPLOAD_PATH || './uploads',
    },

    // Socket.io
    socket: {
        corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
    },
});

// ===========================================
// Redis Service - Cache & Session Management
// ===========================================
// Handles Redis operations for caching and sessions
// Author: Vakans.uz Team
// ===========================================

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            this.logger.log('✅ Redis connection established');
        });

        this.client.on('error', (error) => {
            this.logger.error('❌ Redis connection error', error);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
        this.logger.log('🔌 Redis connection closed');
    }

    /**
     * Get Redis client instance
     */
    getClient(): Redis {
        return this.client;
    }

    // ===========================================
    // BASIC OPERATIONS
    // ===========================================

    /**
     * Get value from Redis (parses JSON automatically)
     */
    async get<T = any>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            return value as unknown as T;
        }
    }

    /**
     * Set value in Redis (serializes to JSON automatically)
     */
    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        await this.client.expire(key, ttlSeconds);
    }

    async ttl(key: string): Promise<number> {
        return this.client.ttl(key);
    }

    // ===========================================
    // JSON OPERATIONS
    // ===========================================

    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }

    // ===========================================
    // LIST OPERATIONS
    // ===========================================

    async lpush(key: string, ...values: string[]): Promise<number> {
        return this.client.lpush(key, ...values);
    }

    async rpush(key: string, ...values: string[]): Promise<number> {
        return this.client.rpush(key, ...values);
    }

    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return this.client.lrange(key, start, stop);
    }

    async llen(key: string): Promise<number> {
        return this.client.llen(key);
    }

    // ===========================================
    // SET OPERATIONS
    // ===========================================

    async sadd(key: string, ...members: string[]): Promise<number> {
        return this.client.sadd(key, ...members);
    }

    async srem(key: string, ...members: string[]): Promise<number> {
        return this.client.srem(key, ...members);
    }

    async smembers(key: string): Promise<string[]> {
        return this.client.smembers(key);
    }

    async sismember(key: string, member: string): Promise<boolean> {
        const result = await this.client.sismember(key, member);
        return result === 1;
    }

    // ===========================================
    // HASH OPERATIONS
    // ===========================================

    async hget(key: string, field: string): Promise<string | null> {
        return this.client.hget(key, field);
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        await this.client.hset(key, field, value);
    }

    async hdel(key: string, ...fields: string[]): Promise<void> {
        await this.client.hdel(key, ...fields);
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return this.client.hgetall(key);
    }

    // ===========================================
    // PUB/SUB OPERATIONS
    // ===========================================

    /**
     * Publish a message to a channel
     */
    async publish(channel: string, message: any): Promise<number> {
        if (!this.client) {
            this.logger.warn('Redis client not initialized, cannot publish');
            return 0;
        }
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        return this.client.publish(channel, messageStr);
    }

    /**
     * Subscribe to a channel
     * Note: Requires a separate Redis connection for subscribing
     */
    async subscribe(channel: string, callback: (data: any) => void): Promise<void> {
        if (!this.client) {
            this.logger.warn('Redis client not initialized, deferring subscription');
            // Retry after a delay
            setTimeout(() => this.subscribe(channel, callback), 1000);
            return;
        }

        const subscriber = this.client.duplicate();

        subscriber.on('message', (ch, message) => {
            if (ch === channel) {
                try {
                    const data = JSON.parse(message);
                    callback(data);
                } catch {
                    callback(message);
                }
            }
        });

        await subscriber.subscribe(channel);
        this.logger.log(`Subscribed to Redis channel: ${channel}`);
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    async keys(pattern: string): Promise<string[]> {
        return this.client.keys(pattern);
    }

    async flushdb(): Promise<void> {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot flush database in production!');
        }
        await this.client.flushdb();
    }

    /**
     * Increment counter with optional TTL
     */
    async incr(key: string, ttlSeconds?: number): Promise<number> {
        const value = await this.client.incr(key);
        if (ttlSeconds && value === 1) {
            await this.expire(key, ttlSeconds);
        }
        return value;
    }

    /**
     * Decrement counter
     */
    async decr(key: string): Promise<number> {
        return this.client.decr(key);
    }
}

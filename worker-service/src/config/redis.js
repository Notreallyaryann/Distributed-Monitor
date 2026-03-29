import Redis from "ioredis";

export const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    maxRetriesPerRequest: null
});
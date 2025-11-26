import Redis from 'ioredis';
import { getServerEnv } from './env.server';

// Type assertion is necessary here because globalThis doesn't have a Redis type
// This pattern is safe and commonly used in Next.js to prevent multiple Redis instances
// during hot reloading in development
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function getRedisUrl(): string {
  if (typeof window !== 'undefined') {
    return 'redis://localhost:6379'; // Client-side fallback
  }
  
  try {
    const env = getServerEnv();
    return env.REDIS_URL || 'redis://localhost:6379';
  } catch {
    // Fallback if env validation fails
    return process.env.REDIS_URL || 'redis://localhost:6379';
  }
}

export const redis =
  globalForRedis.redis ??
  new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Cache key patterns
export const CACHE_KEYS = {
  target: (slug: string) => `slug:${slug}:target`,
  hits: (slug: string) => `slug:${slug}:hits`,
  rateLimit: (ip: string) => `rate_limit:${ip}`,
} as const;

// Default TTL: 1 hour
export const CACHE_TTL = 3600;


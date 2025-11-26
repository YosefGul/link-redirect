import { NextRequest } from 'next/server';
import { redis, CACHE_KEYS } from './redis';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = DEFAULT_OPTIONS
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const ip = getClientIP(request);
  const key = CACHE_KEYS.rateLimit(ip);
  
  try {
    // Get current count
    const count = await redis.incr(key);
    
    // Set expiration on first request
    if (count === 1) {
      await redis.pexpire(key, options.windowMs);
    }
    
    const remaining = Math.max(0, options.maxRequests - count);
    const ttl = await redis.pttl(key);
    const resetTime = Date.now() + ttl;

    return {
      allowed: count <= options.maxRequests,
      remaining,
      resetTime,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: options.maxRequests,
      resetTime: Date.now() + options.windowMs,
    };
  }
}


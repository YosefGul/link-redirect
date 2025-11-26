import { redis } from '@/lib/redis';

const TOKEN_CACHE_TTL = 300; // 5 minutes

interface TokenCacheEntry {
  userId: string;
  username: string;
  role: string;
  expiresAt: number;
}

export async function getCachedToken(token: string): Promise<TokenCacheEntry | null> {
  try {
    const cacheKey = `token:${token}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const entry: TokenCacheEntry = JSON.parse(cached);
      // Check if expired
      if (entry.expiresAt > Date.now()) {
        return entry;
      }
      // Remove expired entry
      await redis.del(cacheKey);
    }
    return null;
  } catch (error) {
    console.error('Token cache get error:', error);
    return null;
  }
}

export async function setCachedToken(
  token: string,
  payload: { userId: string; username: string; role: string }
): Promise<void> {
  try {
    const cacheKey = `token:${token}`;
    const entry: TokenCacheEntry = {
      ...payload,
      expiresAt: Date.now() + TOKEN_CACHE_TTL * 1000,
    };
    await redis.setex(cacheKey, TOKEN_CACHE_TTL, JSON.stringify(entry));
  } catch (error) {
    console.error('Token cache set error:', error);
    // Don't throw - caching is optional
  }
}

export async function invalidateCachedToken(token: string): Promise<void> {
  try {
    const cacheKey = `token:${token}`;
    await redis.del(cacheKey);
  } catch (error) {
    console.error('Token cache invalidation error:', error);
  }
}

